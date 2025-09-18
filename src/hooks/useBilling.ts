"use client"

import { useState, useEffect, useCallback } from 'react'
import { BillingInfo, SubscriptionPlan } from '@/lib/types/billing'

interface UseBillingReturn {
  billingInfo: BillingInfo | null
  plans: SubscriptionPlan[]
  loading: boolean
  error: string | null
  refetchBilling: () => Promise<void>
  createCheckoutSession: (planId: string) => Promise<string>
  createPortalSession: () => Promise<string>
  canGenerate: boolean
  quotaRemaining: number | null
}

export function useBilling(): UseBillingReturn {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBillingInfo = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/billing/subscription')

      if (!response.ok) {
        throw new Error('Failed to fetch billing info')
      }

      const data = await response.json()
      setBillingInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching billing info:', err)
    }
  }, [])

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/billing/plans')

      if (!response.ok) {
        throw new Error('Failed to fetch plans')
      }

      const data = await response.json()
      setPlans(data.plans || [])
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError(err instanceof Error ? err.message : 'Failed to load plans')
    }
  }, [])

  const refetchBilling = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchBillingInfo(), fetchPlans()])
    setLoading(false)
  }, [fetchBillingInfo, fetchPlans])

  const createCheckoutSession = useCallback(async (planId: string): Promise<string> => {
    try {
      setError(null)

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          success_url: `${window.location.origin}/billing?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      return data.session_url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const createPortalSession = useCallback(async (): Promise<string> => {
    try {
      setError(null)

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json&apos;,
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/billing`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portal session')
      }

      const data = await response.json()
      return data.portal_url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create portal session'
      setError(message)
      throw new Error(message)
    }
  }, [])

  useEffect(() => {
    refetchBilling()
  }, [refetchBilling])

  const canGenerate = billingInfo?.canGenerate ?? false
  const quotaRemaining = billingInfo?.quotaRemaining ?? null

  return {
    billingInfo,
    plans,
    loading,
    error,
    refetchBilling,
    createCheckoutSession,
    createPortalSession,
    canGenerate,
    quotaRemaining,
  }
}