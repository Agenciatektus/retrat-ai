"use client"

import posthog from 'posthog-js'

export function usePostHog() {
  const capture = (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture(event, properties)
    }
  }

  const identify = (distinctId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.identify(distinctId, properties)
    }
  }

  const reset = () => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.reset()
    }
  }

  const setPersonProperties = (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.setPersonProperties(properties)
    }
  }

  const getFeatureFlag = (flag: string) => {
    if (typeof window !== 'undefined' && posthog) {
      return posthog.getFeatureFlag(flag)
    }
    return undefined
  }

  const isFeatureEnabled = (flag: string) => {
    if (typeof window !== 'undefined' && posthog) {
      return posthog.isFeatureEnabled(flag)
    }
    return false
  }

  return {
    capture,
    identify,
    reset,
    setPersonProperties,
    getFeatureFlag,
    isFeatureEnabled,
    posthog: typeof window !== 'undefined' ? posthog : null
  }
}
