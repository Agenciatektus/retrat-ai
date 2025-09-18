import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { billingService } from '@/lib/services/billing'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const CheckoutRequestSchema = z.object({
  plan_id: z.string(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
})

// POST /api/billing/checkout - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const body = await request.json()
    const { plan_id, success_url, cancel_url } = CheckoutRequestSchema.parse(body)

    // Create checkout session
    const sessionUrl = await billingService.createCheckoutSession(
      user.id,
      plan_id,
      success_url,
      cancel_url
    )

    return NextResponse.json({ session_url: sessionUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/billing/checkout:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}