import { lazy } from 'react'

// =====================================================
// LAZY LOADED COMPONENTS FOR CODE SPLITTING
// =====================================================

// Gallery components (heavy with image processing)
export const LazyImageGallery = lazy(() => 
  import('@/components/gallery/ImageGallery').then(module => ({ 
    default: module.ImageGallery 
  }))
)

export const LazyImagePreviewModal = lazy(() => 
  import('@/components/gallery/ImagePreviewModal').then(module => ({ 
    default: module.ImagePreviewModal 
  }))
)

export const LazyBatchOperations = lazy(() => 
  import('@/components/gallery/BatchOperations').then(module => ({ 
    default: module.BatchOperations 
  }))
)

export const LazyImageComparison = lazy(() => 
  import('@/components/gallery/ImageComparison').then(module => ({ 
    default: module.ImageComparison 
  }))
)

// Export components (heavy with file processing)
export const LazyExportModal = lazy(() => 
  import('@/components/export/ExportModal').then(module => ({ 
    default: module.ExportModal 
  }))
)

// Generation components (heavy with AI processing)
export const LazyGenerationPanel = lazy(() => 
  import('@/components/generation/GenerationPanel').then(module => ({ 
    default: module.GenerationPanel 
  }))
)

// Admin components (only loaded for admin users)
export const LazyAdminDashboard = lazy(() => 
  import('@/app/admin/page').then(module => ({ 
    default: module.default 
  }))
)

export const LazyAdminAnalytics = lazy(() => 
  import('@/app/admin/analytics/page').then(module => ({ 
    default: module.default 
  }))
)

// Onboarding components (only loaded once)
export const LazyOnboardingFlow = lazy(() => 
  import('@/components/onboarding/OnboardingFlow').then(module => ({ 
    default: module.OnboardingFlow 
  }))
)

// =====================================================
// LOADING COMPONENTS
// =====================================================

export function ComponentLoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function GalleryLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/3] bg-surface animate-pulse rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-surface animate-pulse rounded w-3/4" />
            <div className="h-3 bg-surface animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 bg-surface border border-border rounded-xl space-y-4">
          <div className="w-12 h-12 bg-surface-elevated animate-pulse rounded-lg" />
          <div className="space-y-2">
            <div className="h-6 bg-surface-elevated animate-pulse rounded w-3/4" />
            <div className="h-4 bg-surface-elevated animate-pulse rounded w-full" />
            <div className="h-4 bg-surface-elevated animate-pulse rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// =====================================================
// PROGRESSIVE LOADING UTILITIES
// =====================================================

/**
 * Preload route for faster navigation
 */
export function preloadRoute(href: string): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
    })
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  const fontPreloads = [
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
    'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDYbtXK-F2qO03q.woff2'
  ]

  fontPreloads.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Preload critical API endpoints
  const criticalEndpoints = ['/api/projects', '/api/billing/plans']
  
  criticalEndpoints.forEach(endpoint => {
    fetch(endpoint, { method: 'HEAD' }).catch(() => {
      // Ignore errors, this is just for warming up
    })
  })
}

/**
 * Optimize third-party scripts loading
 */
export function loadThirdPartyScripts(): void {
  if (typeof window === 'undefined') return

  // Load non-critical scripts after page load
  window.addEventListener('load', () => {
    // PostHog script is already loaded via instrumentation
    // Sentry script is already loaded via instrumentation
    
    // Load other third-party scripts here if needed
    setTimeout(() => {
      // Any additional analytics or tracking scripts
    }, 2000) // Load after 2 seconds
  })
}
