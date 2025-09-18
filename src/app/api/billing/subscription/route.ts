import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { billingService } from '@/lib/services/billing'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/billing/subscription - Get user's billing info
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const billingInfo = await billingService.getBillingInfo(user.id)

    return NextResponse.json(billingInfo)
  } catch (error) {
    console.error('Error in GET /api/billing/subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing info' },
      { status: 500 }
    )
  }
}
