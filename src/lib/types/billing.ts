export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  price_monthly: number // in cents
  stripe_price_id: string | null
  features: Record<string, unknown>
  quota_generations: number | null // null = unlimited
  quota_period: 'week' | 'month'
  max_resolution: number
  watermark: boolean
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

export interface UserSubscriptionWithPlan extends UserSubscription {
  plan: SubscriptionPlan
}

export interface UsageRecord {
  id: string
  user_id: string
  subscription_id: string | null
  period_start: string
  period_end: string
  generations_used: number
  quota_limit: number | null
  created_at: string
  updated_at: string
}

export interface StripeEvent {
  id: string
  stripe_event_id: string
  event_type: string
  processed: boolean
  user_id: string | null
  subscription_id: string | null
  data: Record<string, unknown>
  error_message: string | null
  created_at: string
}

export interface BillingInfo {
  subscription: UserSubscriptionWithPlan | null
  currentUsage: UsageRecord | null
  canGenerate: boolean
  quotaRemaining: number | null // null = unlimited
}

export interface CreateCheckoutSessionRequest {
  price_id: string
  success_url: string
  cancel_url: string
}

export interface CreateCheckoutSessionResponse {
  session_url: string
}

export interface CreatePortalSessionRequest {
  return_url: string
}

export interface CreatePortalSessionResponse {
  portal_url: string
}

// Stripe webhook event types we handle
export type StripeWebhookEventType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'

export interface StripeWebhookEvent {
  id: string
  object: 'event'
  type: StripeWebhookEventType
  data: {
    object: Record<string, unknown>
  }
  created: number
}

// Plan comparison data for pricing page
export interface PlanComparison {
  planId: string
  name: string
  price: number
  period: string
  features: {
    name: string
    included: boolean
    value?: string
  }[]
  popular?: boolean
  cta: string
}

// Billing dashboard summary
export interface BillingDashboard {
  currentPlan: SubscriptionPlan
  subscription: UserSubscription | null
  usage: {
    current: number
    limit: number | null
    period: string
    resetDate: string
  }
  paymentMethod?: {
    brand: string
    last4: string
    expiry: string
  }
  upcomingInvoice?: {
    amount: number
    date: string
  }
}