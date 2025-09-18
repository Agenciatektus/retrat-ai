import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripeService } from '@/lib/services/stripe'
import { getPremiumPrice } from '@/lib/pricing'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const PremiumAddonRequestSchema = z.object({
  count: z.number().int().min(1).max(20).default(1), // Max 20 premium photos per transaction
  success_url: z.string().url(),
  cancel_url: z.string().url()
})

// POST /api/addon/premium - Create premium photo add-on charge
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
    const { count, success_url, cancel_url } = PremiumAddonRequestSchema.parse(body)

    // Get premium price
    const premiumPrice = getPremiumPrice()
    const totalAmount = Math.round(premiumPrice * count * 100) // Convert to cents

    // Get or create Stripe customer
    let customerId = ''

    // Check if user already has a customer ID
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id
    } else {
      // Create new customer
      const customer = await stripeService.createCustomer({
        userId: user.id,
        email: user.email!,
        name: user.user_metadata?.name
      })
      customerId = customer.id
    }

    // Create one-time payment checkout session
    const session = await stripeService.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `${count} Foto${count > 1 ? 's' : ''} Premium`,
              description: 'Geração premium HD+ com recursos avançados',
              metadata: {
                addon_type: 'premium',
                count: count.toString(),
                user_id: user.id
              }
            },
            unit_amount: Math.round(premiumPrice * 100), // Price per unit in cents
          },
          quantity: count,
        },
      ],
      mode: 'payment', // One-time payment, not subscription
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        addon_type: 'premium',
        count: count.toString(),
        user_id: user.id,
        price_per_unit: premiumPrice.toString()
      }
    })

    // Log the addon request for tracking
    await supabase
      .from('stripe_events')
      .insert({
        stripe_event_id: `addon_request_${session.id}`,
        event_type: 'addon.premium.requested',
        user_id: user.id,
        data: {
          session_id: session.id,
          count,
          total_amount: totalAmount,
          price_per_unit: premiumPrice
        },
        processed: false
      })

    return NextResponse.json({
      success: true,
      session_url: session.url,
      session_id: session.id,
      details: {
        count,
        price_per_unit: premiumPrice,
        total_price: premiumPrice * count,
        currency: 'BRL'
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/addon/premium:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create premium addon' },
      { status: 500 }
    )
  }
}
