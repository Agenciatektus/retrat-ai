/**
 * Billing Helpers for Pricing v1.2
 * 
 * Handles credit debiting and addon charging
 */

import { createClient } from '@/lib/supabase/server'
import { ADDON_PRICES_BRL } from '@/lib/pricing'

export interface BillingResult {
  success: boolean
  error?: string
  code?: string
  billing?: {
    type: 'standard_credit' | 'premium_included' | 'addon_payment'
    amount: number
    price_brl?: number
  }
}

/**
 * Debit standard credits from user's monthly quota
 */
export async function debitStandard(userId: string, amount: number = 1): Promise<BillingResult> {
  try {
    const supabase = createClient()
    
    const { data: success, error } = await supabase.rpc('debit_standard_credits', {
      user_uuid: userId,
      amount
    })

    if (error) {
      console.error('Error debiting standard credits:', error)
      return {
        success: false,
        error: 'Failed to debit standard credits',
        code: 'BILLING_ERROR'
      }
    }

    if (!success) {
      return {
        success: false,
        error: 'Insufficient standard credits. Upgrade your plan or wait for next month.',
        code: 'QUOTA_EXCEEDED'
      }
    }

    return {
      success: true,
      billing: {
        type: 'standard_credit',
        amount
      }
    }
  } catch (error) {
    console.error('Exception in debitStandard:', error)
    return {
      success: false,
      error: 'Billing system error',
      code: 'BILLING_ERROR'
    }
  }
}

/**
 * Try to debit from premium included quota
 * Returns true if successful, false if no credits available
 */
export async function debitPremiumIncluded(userId: string, amount: number = 1): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data: success, error } = await supabase.rpc('debit_premium_credits', {
      user_uuid: userId,
      amount
    })

    if (error) {
      console.error('Error debiting premium credits:', error)
      return false
    }

    return success || false
  } catch (error) {
    console.error('Exception in debitPremiumIncluded:', error)
    return false
  }
}

/**
 * Charge addon payment (Stripe one-off or balance)
 */
export async function chargeAddon(
  userId: string, 
  kind: 'fast' | 'premium' | 'upscale', 
  customPrice?: number
): Promise<BillingResult> {
  try {
    const price = customPrice || ADDON_PRICES_BRL[kind]
    
    // TODO: Implement Stripe one-off payment
    // For now, create addon purchase record and return payment required
    const supabase = createClient()
    
    const { data: purchase, error } = await supabase
      .from('addon_purchases')
      .insert({
        user_id: userId,
        addon_type: kind,
        price_brl: price,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating addon purchase:', error)
      return {
        success: false,
        error: 'Failed to create addon purchase',
        code: 'BILLING_ERROR'
      }
    }

    // In a real implementation, this would:
    // 1. Create Stripe PaymentIntent
    // 2. Return payment URL or client_secret
    // 3. Handle webhook to confirm payment
    
    return {
      success: false,
      error: `${kind} generation requires payment of R$${price.toFixed(2)}`,
      code: 'PAYMENT_REQUIRED',
      billing: {
        type: 'addon_payment',
        amount: 1,
        price_brl: price
      }
    }
  } catch (error) {
    console.error('Exception in chargeAddon:', error)
    return {
      success: false,
      error: 'Addon charging system error',
      code: 'BILLING_ERROR'
    }
  }
}

/**
 * Get user's current usage and quotas
 */
export async function getUserUsage(userId: string) {
  try {
    const supabase = createClient()
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    // Get usage record
    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    // Get subscription info
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, premium_included')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage:', usageError)
      return null
    }

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
      return null
    }

    return {
      usage: usage || {
        std_used: 0,
        premium_used: 0,
        fast_paid: 0,
        upscale_paid: 0,
        edit_used: 0,
        kontext_used: 0
      },
      subscription: subscription || null,
      quotas: {
        standard: subscription?.quota_limit || 15, // Free plan default
        premium_included: subscription?.premium_included || 0
      }
    }
  } catch (error) {
    console.error('Exception in getUserUsage:', error)
    return null
  }
}

/**
 * Check if user can perform a specific action
 */
export async function canUserGenerate(userId: string, engine: string): Promise<BillingResult> {
  const usage = await getUserUsage(userId)
  if (!usage) {
    return {
      success: false,
      error: 'Failed to fetch user usage',
      code: 'BILLING_ERROR'
    }
  }

  switch (engine) {
    case 'standard':
      if (usage.usage.std_used >= usage.quotas.standard) {
        return {
          success: false,
          error: 'Standard quota exceeded',
          code: 'QUOTA_EXCEEDED'
        }
      }
      return { success: true }

    case 'premium':
    case 'edit':
    case 'kontext':
      if (usage.usage.premium_used < usage.quotas.premium_included) {
        return { success: true }
      }
      return {
        success: false,
        error: `Premium generation requires payment of R$${ADDON_PRICES_BRL.premium.toFixed(2)}`,
        code: 'PAYMENT_REQUIRED'
      }

    case 'fast':
      return {
        success: false,
        error: `Fast generation requires payment of R$${ADDON_PRICES_BRL.fast.toFixed(2)}`,
        code: 'PAYMENT_REQUIRED'
      }

    case 'upscale':
      return {
        success: false,
        error: `Upscale requires payment of R$${ADDON_PRICES_BRL.upscale.toFixed(2)}`,
        code: 'PAYMENT_REQUIRED'
      }

    default:
      return {
        success: false,
        error: 'Unknown engine type',
        code: 'INVALID_ENGINE'
      }
  }
}
