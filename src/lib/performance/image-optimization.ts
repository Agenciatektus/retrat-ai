import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary for performance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface OptimizedImageOptions {
  width?: number
  height?: number
  quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  progressive?: boolean
  dpr?: number // Device pixel ratio
}

/**
 * Generate optimized image URL with responsive breakpoints
 */
export function getOptimizedImageUrl(
  publicId: string, 
  options: OptimizedImageOptions = {}
): string {
  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    crop = 'limit',
    gravity = 'auto',
    progressive = true,
    dpr = 1
  } = options

  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        quality,
        fetch_format: format,
        crop,
        gravity,
        progressive,
        dpr,
        // Performance optimizations
        flags: ['progressive', 'immutable_cache', 'strip_profile'],
        // Automatic optimizations
        effect: 'sharpen:80',
        // Compression optimization
        if: 'w_gt_1000',
        quality: 'auto:eco'
      }
    ],
    secure: true,
    sign_url: false
  })
}

/**
 * Generate responsive image srcset for different screen sizes
 */
export function getResponsiveImageSrcSet(
  publicId: string,
  options: OptimizedImageOptions = {}
): string {
  const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920]
  
  return breakpoints
    .map(width => {
      const url = getOptimizedImageUrl(publicId, {
        ...options,
        width,
        dpr: 1
      })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Generate responsive image srcset for different device pixel ratios
 */
export function getRetinaImageSrcSet(
  publicId: string,
  width: number,
  options: OptimizedImageOptions = {}
): string {
  const dprs = [1, 1.5, 2, 3]
  
  return dprs
    .map(dpr => {
      const url = getOptimizedImageUrl(publicId, {
        ...options,
        width,
        dpr
      })
      return `${url} ${dpr}x`
    })
    .join(', ')
}

/**
 * Generate placeholder image for lazy loading
 */
export function getPlaceholderImageUrl(
  publicId: string,
  width: number = 40,
  height?: number
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        quality: 'auto:low',
        fetch_format: 'auto',
        crop: 'fill',
        effect: 'blur:1000',
        flags: 'progressive'
      }
    ],
    secure: true
  })
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
    img.src = src
  })
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        const srcset = img.dataset.srcset

        if (src) {
          img.src = src
          img.removeAttribute('data-src')
        }

        if (srcset) {
          img.srcset = srcset
          img.removeAttribute('data-srcset')
        }

        img.classList.remove('lazy')
        observer.unobserve(img)
      }
    })
  }, {
    // Load images 100px before they come into view
    rootMargin: '100px'
  })

  // Observe all lazy images
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })
}

/**
 * Calculate optimal image dimensions for container
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = 1
): { width: number; height: number } {
  // Round up to nearest multiple of 100 for better caching
  const optimalWidth = Math.ceil((containerWidth * devicePixelRatio) / 100) * 100
  const optimalHeight = Math.ceil((containerHeight * devicePixelRatio) / 100) * 100

  return { width: optimalWidth, height: optimalHeight }
}

