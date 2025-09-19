"use client"

import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.warn('PostHog key not found in environment variables')
      return
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll capture pageviews manually
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded successfully')
          posthog.debug()
        }
      }
    })
  }
}

export { posthog }



