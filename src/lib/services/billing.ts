import { createClient } from '@/lib/supabase/server'
import { stripeService } from './stripe'
import {
  SubscriptionPlan,
  UserSubscription,
  UserSubscriptionWithPlan,
  UsageRecord,
  BillingInfo,
  SubscriptionStatus,
} from '@/lib/types/billing'

export class BillingService {
  private getSupabaseClient() {
    return createClient()
  }

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    // Return hardcoded plans from pricing.ts instead of database
    const { getPlans } = await import('@/lib/pricing')
    return getPlans()
  }

  /**
   * Get user's current subscription with plan details
   */
  async getUserSubscription(userId: string): Promise<UserSubscriptionWithPlan | null> {
    const supabase = this.getSupabaseClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No subscription found
      }
      console.error('Error fetching user subscription:', error)
      throw new Error(`Failed to fetch subscription: ${error.message}`)
    }

    return data as UserSubscriptionWithPlan
  }

  /**
   * Get user's current usage for the current period
   */
  async getCurrentUsage(userId: string): Promise<UsageRecord | null> {
    // Get current week period
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    const supabase = this.getSupabaseClient()
    const { data, error } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No usage record found
      }
      console.error('Error fetching usage:', error)
      throw new Error(`Failed to fetch usage: ${error.message}`)
    }

    return data
  }

  /**
   * Get complete billing info for a user
   */
  async getBillingInfo(userId: string): Promise<BillingInfo> {
    const [subscription, currentUsage] = await Promise.all([
      this.getUserSubscription(userId),
      this.getCurrentUsage(userId),
    ])

    // If no subscription, user is on free plan
    let plan: SubscriptionPlan
    if (!subscription) {
      const { getFreePlan } = await import('@/lib/pricing')
      plan = getFreePlan()
    } else {
      // Get plan details from pricing.ts based on subscription plan_id
      const { getPlan } = await import('@/lib/pricing')
      plan = getPlan(subscription.plan_id)
    }

    const usedGenerations = currentUsage?.generations_used || 0
    const canGenerate = plan.quota_generations === null || usedGenerations < plan.quota_generations
    const quotaRemaining = plan.quota_generations === null ? null : plan.quota_generations - usedGenerations

    return {
      subscription,
      currentUsage,
      canGenerate,
      quotaRemaining,
    }
  }

  /**
   * Check if user can generate (within quota)
   */
  async canUserGenerate(userId: string): Promise<boolean> {
    const supabase = this.getSupabaseClient()
    const { data, error } = await supabase
      .rpc('can_user_generate', { user_uuid: userId })

    if (error) {
      console.error('Error checking generation quota:', error)
      return false
    }

    return data as boolean
  }

  /**
   * Increment user's generation usage
   */
  async incrementUsage(userId: string): Promise<void> {
    const supabase = this.getSupabaseClient()
    const { error } = await supabase
      .rpc('increment_user_usage', { user_uuid: userId })

    if (error) {
      console.error('Error incrementing usage:', error)
      throw new Error(`Failed to increment usage: ${error.message}`)
    }
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(data: {
    userId: string
    planId: string
    stripeSubscriptionId: string
    stripeCustomerId: string
    status: SubscriptionStatus
    currentPeriodStart: Date
    currentPeriodEnd: Date
  }): Promise<UserSubscription> {
    const supabase = this.getSupabaseClient()
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: data.userId,
        plan_id: data.planId,
        stripe_subscription_id: data.stripeSubscriptionId,
        stripe_customer_id: data.stripeCustomerId,
        status: data.status,
        current_period_start: data.currentPeriodStart.toISOString(),
        current_period_end: data.currentPeriodEnd.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      throw new Error(`Failed to create subscription: ${error.message}`)
    }

    return subscription
  }

  /**
   * Update subscription status
   */
  async updateSubscription(
    stripeSubscriptionId: string,
    updates: {
      status?: SubscriptionStatus
      currentPeriodStart?: Date
      currentPeriodEnd?: Date
      canceledAt?: Date | null
    }
  ): Promise<UserSubscription> {
    const updateData: Record<string, unknown> = {}

    if (updates.status) updateData.status = updates.status
    if (updates.currentPeriodStart) updateData.current_period_start = updates.currentPeriodStart.toISOString()
    if (updates.currentPeriodEnd) updateData.current_period_end = updates.currentPeriodEnd.toISOString()
    if (updates.canceledAt !== undefined) {
      updateData.canceled_at = updates.canceledAt ? updates.canceledAt.toISOString() : null
    }

    const supabase = this.getSupabaseClient()
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      throw new Error(`Failed to update subscription: ${error.message}`)
    }

    return data
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    await Promise.all([
      stripeService.cancelSubscription(stripeSubscriptionId),
      this.updateSubscription(stripeSubscriptionId, {
        canceledAt: new Date(),
      }),
    ])
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(stripeSubscriptionId: string): Promise<void> {
    await Promise.all([
      stripeService.reactivateSubscription(stripeSubscriptionId),
      this.updateSubscription(stripeSubscriptionId, {
        canceledAt: null,
      }),
    ])
  }

  /**
   * Create Stripe customer and store reference
   */
  async createStripeCustomer(userId: string, email: string, name?: string): Promise<string> {
    const customer = await stripeService.createCustomer({
      userId,
      email,
      name,
    })

    return customer.id
  }

  /**
   * Create checkout session for plan upgrade
   */
  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    // Get plan details
    const supabase = this.getSupabaseClient()
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      throw new Error(`Plan not found: ${planId}`)
    }

    if (!plan.stripe_price_id) {
      throw new Error(`Plan ${planId} does not have a Stripe price ID`)
    }

    // Get user info for customer creation
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Create or get Stripe customer
    let customerId = ''
    const existingSubscription = await this.getUserSubscription(userId)

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id
    } else {
      customerId = await this.createStripeCustomer(
        userId,
        user.email!,
        user.user_metadata?.name
      )
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId: plan.stripe_price_id,
      successUrl,
      cancelUrl,
      userId,
    })

    return session.url!
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(userId: string, returnUrl: string): Promise<string> {
    const subscription = await this.getUserSubscription(userId)

    if (!subscription?.stripe_customer_id) {
      throw new Error('No active subscription found')
    }

    const session = await stripeService.createPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl,
    })

    return session.url
  }

  /**
   * Log Stripe webhook event
   */
  async logStripeEvent(event: {
    stripe_event_id: string
    event_type: string
    user_id?: string
    subscription_id?: string
    data: Record<string, unknown>
  }): Promise<void> {
    const supabase = this.getSupabaseClient()
    const { error } = await supabase
      .from('stripe_events')
      .insert({
        stripe_event_id: event.stripe_event_id,
        event_type: event.event_type,
        user_id: event.user_id || null,
        subscription_id: event.subscription_id || null,
        data: event.data,
        processed: false,
      })

    if (error) {
      console.error('Error logging Stripe event:', error)
    }
  }

  /**
   * Mark Stripe event as processed
   */
  async markEventProcessed(stripeEventId: string, error?: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      processed: true,
    }

    if (error) {
      updateData.error_message = error
    }

    const supabase = this.getSupabaseClient()
    const { error: dbError } = await supabase
      .from('stripe_events')
      .update(updateData)
      .eq('stripe_event_id', stripeEventId)

    if (dbError) {
      console.error('Error marking event as processed:', dbError)
    }
  }
}

export const billingService = new BillingService()
