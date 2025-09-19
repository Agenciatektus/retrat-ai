import { NextRequest, NextResponse } from 'next/server'
import { PLANS, ADDON_PRICES_BRL, FEATURE_FLAGS, COSTS_BRL } from '@/lib/pricing'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/plans - Return current pricing configuration v1.2
export async function GET(request: NextRequest) {
  try {
    // Check if v1.2 pricing is enabled
    if (!FEATURE_FLAGS.pricing_v1_2) {
      // Return legacy plans if flag is disabled
      return NextResponse.json({
        version: '1.1',
        plans: PLANS.map(plan => ({
          ...plan,
          premiumIncluded: undefined // Hide v1.2 fields
        })),
        success: true
      })
    }

    return NextResponse.json({
      version: '1.2',
      plans: PLANS,
      addons: ADDON_PRICES_BRL,
      engines: {
        standard: { 
          name: 'Standard (SDXL)', 
          cost_brl: COSTS_BRL.standard, 
          included: true,
          description: 'Qualidade padrão, ideal para a maioria dos casos'
        },
        fast: { 
          name: 'Fast (Imagen-4)', 
          cost_brl: COSTS_BRL.fast, 
          addon_price: ADDON_PRICES_BRL.fast,
          description: 'Geração rápida com qualidade superior'
        },
        premium: { 
          name: 'Premium (Imagen-4)', 
          cost_brl: COSTS_BRL.premium, 
          addon_price: ADDON_PRICES_BRL.premium,
          description: 'Máxima qualidade fotorrealística'
        },
        upscale: { 
          name: 'Upscale (Crisp)', 
          cost_brl: COSTS_BRL.upscale, 
          addon_price: ADDON_PRICES_BRL.upscale,
          description: 'Aumento de resolução com qualidade crisp'
        }
      },
      success: true
    })
  } catch (error) {
    console.error('Error in GET /api/plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
