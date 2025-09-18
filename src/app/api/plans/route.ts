import { NextRequest, NextResponse } from 'next/server'
import { getCurrentPricingConfig } from '@/lib/pricing'

// GET /api/plans - Return current pricing configuration
export async function GET(request: NextRequest) {
  try {
    const config = getCurrentPricingConfig()

    // Return the complete pricing configuration
    // (excluding copy_cards.notes if needed for cleaner API response)
    const response = {
      version: config.version,
      currency: config.currency,
      addons: config.addons,
      plans: config.plans,
      copy_cards: Object.fromEntries(
        Object.entries(config.copy_cards).map(([key, value]) => [key, value])
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
