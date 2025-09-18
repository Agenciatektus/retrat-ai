import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getPlan, canUserGenerate } from '@/lib/pricing'
import { z } from 'zod'

const debitSchema = z.object({
  type: z.enum(['standard', 'premium']),
  count: z.number().min(1).max(10).default(1),
})

// POST /api/usage/debit - Debit user credits and validate quotas
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const body = await request.json()
    const { type, count } = debitSchema.parse(body)

    // Get user profile and plan
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const plan = getPlan(profile.plan)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage:', usageError)
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
    }

    // Current usage (default to 0 if no record)
    const currentUsage = {
      std_used: usage?.generation_count || 0,
      premium_used: usage?.premium_used || 0,
    }

    // Check if user can generate
    const canGenerate = canUserGenerate(plan, currentUsage, type)
    
    if (!canGenerate.canGenerate) {
      return NextResponse.json({ 
        ok: false,
        error: canGenerate.reason,
        remaining: {
          standard: Math.max(0, plan.std_credits - currentUsage.std_used),
          premium: Math.max(0, plan.premium_included - currentUsage.premium_used),
        },
        requires_addon: canGenerate.reason === 'Premium add-on required'
      }, { status: 429 })
    }

    // Debit credits
    try {
      if (type === 'standard') {
        // Update or create usage record for standard credits
        const { error: updateError } = await supabase
          .from('usage')
          .upsert({
            user_id: user.id,
            month: currentMonth,
            generation_count: currentUsage.std_used + count,
            quota_limit: plan.std_credits,
            premium_used: currentUsage.premium_used,
            updated_at: new Date().toISOString(),
          })

        if (updateError) {
          console.error('Error updating usage:', updateError)
          return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
        }

      } else if (type === 'premium') {
        // Update premium usage
        const { error: updateError } = await supabase
          .from('usage')
          .upsert({
            user_id: user.id,
            month: currentMonth,
            generation_count: currentUsage.std_used,
            quota_limit: plan.std_credits,
            premium_used: currentUsage.premium_used + count,
            updated_at: new Date().toISOString(),
          })

        if (updateError) {
          console.error('Error updating premium usage:', updateError)
          return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
        }
      }

      // Calculate remaining credits
      const newUsage = {
        std_used: type === 'standard' ? currentUsage.std_used + count : currentUsage.std_used,
        premium_used: type === 'premium' ? currentUsage.premium_used + count : currentUsage.premium_used,
      }

      return NextResponse.json({
        ok: true,
        debited: {
          type,
          count,
        },
        remaining: {
          standard: Math.max(0, plan.std_credits - newUsage.std_used),
          premium: Math.max(0, plan.premium_included - newUsage.premium_used),
        },
        plan: profile.plan,
      })

    } catch (error) {
      console.error('Error debiting credits:', error)
      return NextResponse.json({ error: 'Failed to debit credits' }, { status: 500 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Unexpected error in POST /api/usage/debit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
