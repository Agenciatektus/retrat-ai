export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side PostHog initialization
    const { PostHog } = await import('posthog-node')
    
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      })
      
      // Make PostHog available globally for server-side tracking
      ;(global as any).posthog = posthog
    }
  }
}
