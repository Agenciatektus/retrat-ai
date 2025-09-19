/**
 * Telemetry for Pricing v1.2
 * 
 * Tracks engine selection, addon purchases, and generation events
 */

import { PostHog } from 'posthog-node'

// Initialize PostHog client
const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  }
)

export interface TelemetryEvent {
  event: string
  userId: string
  properties?: Record<string, unknown>
  timestamp?: Date
}

/**
 * Track an event
 */
export function track(event: string, userId: string, properties: Record<string, unknown> = {}) {
  try {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.log('[Telemetry]', event, { userId, ...properties })
      return
    }

    posthog.capture({
      distinctId: userId,
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        version: '1.2'
      }
    })
  } catch (error) {
    console.error('Telemetry error:', error)
  }
}

/**
 * Track engine selection
 */
export function trackEngineSelected(userId: string, engine: string, costBrl: number, billingType: string) {
  track('engine_selected', userId, {
    engine,
    cost_brl: costBrl,
    billing_type: billingType,
    provider: getProviderForEngine(engine)
  })
}

/**
 * Track addon purchase
 */
export function trackAddonPurchased(userId: string, addonType: 'fast' | 'premium' | 'upscale', priceBrl: number) {
  track(`addon_purchased_${addonType}`, userId, {
    addon_type: addonType,
    price_brl: priceBrl,
    currency: 'BRL'
  })
}

/**
 * Track generation success
 */
export function trackGenerationSucceeded(
  userId: string, 
  generationId: string, 
  engine: string, 
  processingTimeMs?: number
) {
  track('generation_succeeded', userId, {
    generation_id: generationId,
    engine,
    processing_time_ms: processingTimeMs,
    provider: getProviderForEngine(engine)
  })
}

/**
 * Track generation failure
 */
export function trackGenerationFailed(
  userId: string, 
  generationId: string, 
  engine: string, 
  errorMessage: string
) {
  track('generation_failed', userId, {
    generation_id: generationId,
    engine,
    error_message: errorMessage,
    provider: getProviderForEngine(engine)
  })
}

/**
 * Track quota exceeded
 */
export function trackQuotaExceeded(userId: string, quotaType: 'standard' | 'premium') {
  track('quota_exceeded', userId, {
    quota_type: quotaType
  })
}

/**
 * Track plan upgrade
 */
export function trackPlanUpgrade(userId: string, fromPlan: string, toPlan: string, priceBrl: number) {
  track('plan_upgraded', userId, {
    from_plan: fromPlan,
    to_plan: toPlan,
    price_brl: priceBrl
  })
}

/**
 * Track feature flag usage
 */
export function trackFeatureFlag(userId: string, flagName: string, value: boolean) {
  track('feature_flag_used', userId, {
    flag_name: flagName,
    flag_value: value
  })
}

/**
 * Helper to get provider for engine
 */
function getProviderForEngine(engine: string): string {
  const providers = {
    standard: 'replicate',
    fast: 'replicate',
    premium: 'kie',
    edit: 'kie',
    kontext: 'kie',
    upscale: 'kie'
  }
  return providers[engine as keyof typeof providers] || 'unknown'
}

/**
 * Batch tracking for multiple events
 */
export function trackBatch(events: TelemetryEvent[]) {
  try {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.log('[Telemetry Batch]', events)
      return
    }

    events.forEach(({ event, userId, properties = {} }) => {
      posthog.capture({
        distinctId: userId,
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          version: '1.2'
        }
      })
    })
  } catch (error) {
    console.error('Batch telemetry error:', error)
  }
}

/**
 * Identify user with properties
 */
export function identify(userId: string, properties: Record<string, unknown> = {}) {
  try {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.log('[Telemetry Identify]', userId, properties)
      return
    }

    posthog.identify({
      distinctId: userId,
      properties: {
        ...properties,
        last_seen: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Identify error:', error)
  }
}

/**
 * Flush events (useful for serverless environments)
 */
export async function flush() {
  try {
    await posthog.shutdown()
  } catch (error) {
    console.error('Flush error:', error)
  }
}
