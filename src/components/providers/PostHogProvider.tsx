"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { useAuth } from '@/hooks/useAuth'

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname()
  const { user, profile } = useAuth()

  // Track page views
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      // Get search params safely from window.location
      const url = window.location.href
      
      posthog?.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname])

  // Identify user when authenticated
  useEffect(() => {
    if (user && profile && typeof window !== 'undefined') {
      posthog?.identify(user.id, {
        email: user.email,
        name: profile.full_name,
        plan: profile.plan,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
      })
    }
  }, [user, profile])

  return <>{children}</>
}

