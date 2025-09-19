import { PostHog } from 'posthog-node'

let posthogInstance: PostHog | null = null

export function getPostHogServer(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn('PostHog key not found in environment variables')
    return null
  }

  if (!posthogInstance) {
    posthogInstance = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    })
  }

  return posthogInstance
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const posthog = getPostHogServer()
  if (!posthog) return

  try {
    posthog.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        $lib: 'posthog-node',
        $lib_version: '4.0.1'
      }
    })
  } catch (error) {
    console.error('Error capturing PostHog event:', error)
  }
}

export async function identifyUser(
  distinctId: string,
  properties?: Record<string, any>
) {
  const posthog = getPostHogServer()
  if (!posthog) return

  try {
    posthog.identify({
      distinctId,
      properties
    })
  } catch (error) {
    console.error('Error identifying PostHog user:', error)
  }
}

export async function flushPostHog() {
  const posthog = getPostHogServer()
  if (!posthog) return

  try {
    await posthog.flush()
  } catch (error) {
    console.error('Error flushing PostHog:', error)
  }
}



