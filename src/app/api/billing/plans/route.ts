import { NextRequest, NextResponse } from 'next/server'
import { billingService } from '@/lib/services/billing'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/billing/plans - Get all subscription plans
export async function GET(request: NextRequest) {
  try {
    const plans = await billingService.getPlans()

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error in GET /api/billing/plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}