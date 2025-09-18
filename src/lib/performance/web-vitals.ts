"use client"

import { useEffect } from 'react'
import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals'
import { usePostHog } from '@/hooks/usePostHog'
import { useSentry } from '@/hooks/useSentry'

/**
 * Track Core Web Vitals and send to analytics
 */
export function trackWebVitals() {
  function sendToAnalytics(metric: Metric) {
    // Send to PostHog if available
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
        metric_delta: metric.delta,
        metric_rating: metric.rating || 'unknown'
      })
    }

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
}

/**
 * Optimize LCP (Largest Contentful Paint)
 */
export function optimizeLCP() {
  // Preload critical resources
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const fontPreloads = [
      { href: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', type: 'font/woff2' },
      { href: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDYbtXK-F2qO03q.woff2', type: 'font/woff2' }
    ]

    fontPreloads.forEach(({ href, type }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = 'font'
      link.type = type
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })

    // Preload critical images
    const heroImage = document.querySelector('[data-hero-image]') as HTMLImageElement
    if (heroImage && heroImage.dataset.src) {
      const img = new Image()
      img.src = heroImage.dataset.src
    }
  }
}

/**
 * Optimize INP (Interaction to Next Paint)
 */
export function optimizeINP() {
  if (typeof window === 'undefined') return

  // Debounce rapid interactions
  let isProcessing = false
  
  document.addEventListener('click', (event) => {
    if (isProcessing) {
      event.preventDefault()
      return
    }
    
    isProcessing = true
    setTimeout(() => {
      isProcessing = false
    }, 100)
  }, { capture: true })

  // Use scheduler.postTask for non-urgent work
  if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
    // @ts-expect-error - Scheduler API is experimental
    window.scheduler.postTask(() => {
      // Non-urgent initialization work
      initializeNonCriticalFeatures()
    }, { priority: 'background' })
  } else {
    // Fallback for browsers without scheduler
    setTimeout(initializeNonCriticalFeatures, 1000)
  }
}

/**
 * Optimize CLS (Cumulative Layout Shift)
 */
export function optimizeCLS() {
  if (typeof window === 'undefined') return

  // Set explicit dimensions for images
  const images = document.querySelectorAll('img:not([width]):not([height])')
  images.forEach((img: HTMLImageElement) => {
    // Set aspect ratio to prevent layout shift
    img.style.aspectRatio = '16/9' // Default aspect ratio
  })

  // Reserve space for dynamic content
  const dynamicContainers = document.querySelectorAll('[data-dynamic-content]')
  dynamicContainers.forEach((container: HTMLElement) => {
    if (!container.style.minHeight) {
      container.style.minHeight = '200px' // Reserve minimum space
    }
  })
}

/**
 * Initialize non-critical features
 */
function initializeNonCriticalFeatures() {
  // Initialize analytics
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('app_initialized', {
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    })
  }

  // Initialize lazy loading
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ''
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      })
    })

    lazyImages.forEach(img => imageObserver.observe(img))
  }
}

/**
 * Performance monitoring hook
 */
export function useWebVitals() {
  useEffect(() => {
    trackWebVitals()
    optimizeLCP()
    optimizeINP()
    optimizeCLS()
  }, [])
}

// Initialize web vitals tracking
if (typeof window !== 'undefined') {
  // Track vitals on page load
  window.addEventListener('load', () => {
    trackWebVitals()
    optimizeLCP()
    optimizeINP()
    optimizeCLS()
  })
}

