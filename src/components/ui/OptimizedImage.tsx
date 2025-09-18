"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl, getResponsiveImageSrcSet, getPlaceholderImageUrl } from '@/lib/performance/image-optimization'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  publicId: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number
  placeholder?: 'blur' | 'empty'
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  publicId,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  quality = 'auto:good',
  placeholder = 'blur',
  sizes,
  fill = false,
  style,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(publicId, {
    width,
    height,
    quality,
    format: 'auto'
  })

  const blurDataURL = placeholder === 'blur' 
    ? getPlaceholderImageUrl(publicId, 40, Math.floor(40 * (height / width)))
    : undefined

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-surface border border-border rounded-lg",
          className
        )}
        style={{ width, height, ...style }}
      >
        <div className="text-center text-foreground-muted">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">Erro ao carregar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-surface animate-pulse rounded-lg"
          style={{ width, height }}
        />
      )}

      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={75} // Next.js quality setting
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes || `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
    </div>
  )
}

/**
 * Optimized Avatar component for user profiles
 */
interface OptimizedAvatarProps {
  publicId?: string
  alt: string
  size?: number
  className?: string
  fallbackSrc?: string
}

export function OptimizedAvatar({
  publicId,
  alt,
  size = 40,
  className,
  fallbackSrc
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false)

  if (!publicId || hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-surface border border-border rounded-full",
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallbackSrc ? (
          <Image
            src={fallbackSrc}
            alt={alt}
            width={size}
            height={size}
            className="rounded-full"
          />
        ) : (
          <svg className="w-1/2 h-1/2 text-foreground-muted" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>
    )
  }

  const optimizedSrc = getOptimizedImageUrl(publicId, {
    width: size * 2, // 2x for retina
    height: size * 2,
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'face'
  })

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={() => setHasError(true)}
    />
  )
}

