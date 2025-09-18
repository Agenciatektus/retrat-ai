import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export interface CreateCustomerParams {
  email: string
  name?: string
  userId: string
}

export interface CreateCheckoutSessionParams {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  userId: string
}

export interface CreatePortalSessionParams {
  customerId: string
  returnUrl: string
}

export class StripeService {
  public stripe: Stripe

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    this.stripe = stripe
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists
      const existingCustomers = await this.stripe.customers.list({
        email: params.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0]
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: {
          userId: params.userId,
        },
      })

      return customer
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        metadata: {
          userId: params.userId,
        },
        subscription_data: {
          metadata: {
            userId: params.userId,
          },
        },
      })

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Create a customer portal session
   */
  async createPortalSession(params: CreatePortalSessionParams): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
      })

      return session
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw new Error(`Failed to create portal session: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      return subscription
    } catch (error) {
      console.error('Error retrieving subscription:', error)
      throw new Error(`Failed to retrieve subscription: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
      return subscription
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      })
      return subscription
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw new Error(`Failed to reactivate subscription: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Get upcoming invoice for subscription
   */
  async getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
    try {
      const invoice = await this.stripe.invoices.retrieveUpcoming({
        customer: customerId,
      })
      return invoice
    } catch (error) {
      // No upcoming invoice is not an error
      if (error instanceof Stripe.errors.StripeError && error.code === 'invoice_upcoming_none') {
        return null
      }
      console.error('Error retrieving upcoming invoice:', error)
      throw new Error(`Failed to retrieve upcoming invoice: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      })
      return paymentMethods.data
    } catch (error) {
      console.error('Error retrieving payment methods:', error)
      throw new Error(`Failed to retrieve payment methods: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required')
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      throw new Error(`Failed to verify webhook: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Get all available prices/plans
   */
  async getActivePrices(): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        type: 'recurring',
        expand: ['data.product'],
      })
      return prices.data
    } catch (error) {
      console.error('Error retrieving prices:', error)
      throw new Error(`Failed to retrieve prices: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId)
      return customer
    } catch (error) {
      console.error('Error retrieving customer:', error)
      throw new Error(`Failed to retrieve customer: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }
}

export const stripeService = new StripeService()
export default stripe