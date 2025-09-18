"use client"

import { useEffect } from 'react'
import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals'
import { usePostHog } from '@/hooks/usePostHog'
import { useSentry } from '@/hooks/useSentry'

interface WebVitalsProviderProps {
  children: React.ReactNode
}

export function WebVitalsProvider({ children }: WebVitalsProviderProps) {
  const { capture } = usePostHog()
  const { logger } = useSentry()

  useEffect(() => {
    function sendToAnalytics(metric: Metric) {
      // Send to PostHog
      capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
        metric_delta: metric.delta,
        metric_rating: metric.rating || 'unknown',
        page_url: window.location.href
      })

      // Log to Sentry for performance monitoring
      logger?.info('Web Vital measured', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        url: window.location.href
      })

      // Console log in development
      if (process.env.NODE_ENV === 'development') {
        const emoji = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴'
        console.log(`${emoji} ${metric.name}: ${metric.value}ms (${metric.rating})`)
      }
    }

    // Track all Core Web Vitals
    getCLS(sendToAnalytics)
    getFCP(sendToAnalytics)
    getFID(sendToAnalytics)
    getLCP(sendToAnalytics)
    getTTFB(sendToAnalytics)

    // Performance optimizations
    optimizePerformance()
  }, [capture, logger])

  return <>{children}</>
}

function optimizePerformance() {
  if (typeof window === 'undefined') return

  // Preload critical resources
  requestIdleCallback(() => {
    // Preload critical routes
    const criticalRoutes = ['/dashboard', '/projects', '/gallery']
    criticalRoutes.forEach(route => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      document.head.appendChild(link)
    })
  })

  // Optimize images with Intersection Observer
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      }
    })
  }, { rootMargin: '100px' })

  // Observe all lazy images
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })

  // Prevent layout shift by setting image dimensions
  document.querySelectorAll('img').forEach((img: HTMLImageElement) => {
    if (!img.width && !img.height && !img.style.aspectRatio) {
      img.style.aspectRatio = '16/9'
    }
  })
}
