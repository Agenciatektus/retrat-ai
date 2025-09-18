import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripeService } from '@/lib/services/stripe'
import { billingService } from '@/lib/services/billing'
import { SubscriptionStatus } from '@/lib/types/billing'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(body, signature)

    console.log(`Received Stripe webhook: ${event.type}`, {
      id: event.id,
      type: event.type,
      created: event.created,
    })

    // Log event for debugging
    await billingService.logStripeEvent({
      stripe_event_id: event.id,
      event_type: event.type,
      data: event.data as Record<string, unknown>,
    })

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdate(event)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event)
          break

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event)
          break

        case 'invoice.payment_failed':
          await handlePaymentFailed(event)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      // Mark event as processed
      await billingService.markEventProcessed(event.id)
    } catch (error) {
      console.error(`Error processing webhook ${event.type}:`, error)

      // Mark event as processed with error
      await billingService.markEventProcessed(
        event.id,
        error instanceof Error ? error.message : 'Unknown error'
      )

      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error in Stripe webhook handler:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionUpdate(event: any) {
  const subscription = event.data.object
  const userId = subscription.metadata?.userId

  if (!userId) {
    throw new Error('Missing userId in subscription metadata')
  }

  // Map Stripe status to our status
  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'active',
    canceled: 'canceled',
    past_due: 'past_due',
    incomplete: 'incomplete',
    trialing: 'trialing',
  }

  const status = statusMap[subscription.status] || 'incomplete'

  // Determine plan ID from price
  const planId = await getPlanIdFromPriceId(subscription.items.data[0]?.price?.id)

  try {
    // Try to update existing subscription
    await billingService.updateSubscription(subscription.id, {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
  } catch (updateError) {
    // If update fails, create new subscription
    await billingService.createSubscription({
      userId,
      planId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
  }

  console.log(`Subscription ${event.type} processed for user ${userId}`)
}

async function handleSubscriptionDeleted(event: any) {
  const subscription = event.data.object

  await billingService.updateSubscription(subscription.id, {
    status: 'canceled',
    canceledAt: new Date(),
  })

  console.log(`Subscription deleted: ${subscription.id}`)
}

async function handlePaymentSucceeded(event: any) {
  const invoice = event.data.object

  // If this is a subscription invoice, ensure subscription is active
  if (invoice.subscription) {
    const subscription = await stripeService.getSubscription(invoice.subscription)

    await billingService.updateSubscription(invoice.subscription, {
      status: 'active',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
  }

  console.log(`Payment succeeded for invoice: ${invoice.id}`)
}

async function handlePaymentFailed(event: any) {
  const invoice = event.data.object

  // If this is a subscription invoice, update status
  if (invoice.subscription) {
    await billingService.updateSubscription(invoice.subscription, {
      status: 'past_due',
    })
  }

  console.log(`Payment failed for invoice: ${invoice.id}`)
}

async function getPlanIdFromPriceId(priceId?: string): Promise<string> {
  if (!priceId) return 'free'

  try {
    // Get price details from Stripe to determine plan
    const price = await stripeService.stripe.prices.retrieve(priceId, {
      expand: ['product']
    })

    // Check if the price has metadata indicating the plan
    if (price.metadata?.plan_id) {
      return price.metadata.plan_id
    }

    // Check product metadata
    const product = price.product as any
    if (product?.metadata?.plan_id) {
      return product.metadata.plan_id
    }

    // Fallback: if it's a paid subscription, assume pro
    return price.unit_amount && price.unit_amount > 0 ? 'pro' : 'free'
  } catch (error) {
    console.error('Error retrieving price from Stripe:', error)
    // Fallback: assume pro for any paid subscription
    return 'pro'
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs'