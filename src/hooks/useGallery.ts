"use client"

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import type { GalleryImage } from '@/components/gallery/ImageGallery'

interface UseGalleryReturn {
  // Actions
  downloadImage: (imageId: string, filename?: string) => Promise<boolean>
  downloadMultiple: (imageIds: string[]) => Promise<boolean>
  favoriteImage: (imageId: string, isFavorite: boolean) => Promise<boolean>
  rateImage: (imageId: string, rating: number) => Promise<boolean>
  deleteImage: (imageId: string) => Promise<boolean>
  deleteMultiple: (imageIds: string[]) => Promise<boolean>

  // State
  loading: boolean
  error: string | null

  // Utilities
  clearError: () => void
  getImageUrl: (image: GalleryImage, size?: 'original' | 'large' | 'medium' | 'small') => string
  generateShareUrl: (imageId: string) => string
}

export function useGallery(): UseGalleryReturn {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Download a single image
   */
  const downloadImage = useCallback(async (imageId: string, filename?: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/assets/${imageId}/download`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to download image')
      }

      // Get the blob data
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Extract filename from response headers or use provided filename
      const contentDisposition = response.headers.get('content-disposition')
      const extractedFilename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/['"]/g, '&apos;) || filename || `image-${imageId}.jpg`

      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = extractedFilename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  /**
   * Download multiple images as zip
   */
  const downloadMultiple = useCallback(async (imageIds: string[]): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    if (imageIds.length === 0) {
      setError('No images selected')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/assets/download/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageIds })
      })

      if (!response.ok) {
        throw new Error('Failed to download images')
      }

      // Get the zip blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a&apos;)
      link.href = url
      link.download = `retrat-images-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch download failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  /**
   * Toggle favorite status of an image
   */
  const favoriteImage = useCallback(async (imageId: string, isFavorite: boolean): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated&apos;)
      return false
    }

    try {
      const response = await fetch(`/api/assets/${imageId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_favorite: isFavorite })
      })

      if (!response.ok) {
        throw new Error('Failed to update favorite status')
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update favorite'
      setError(errorMessage)
      return false
    }
  }, [user])

  /**
   * Rate an image
   */
  const rateImage = useCallback(async (imageId: string, rating: number): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5&apos;)
      return false
    }

    try {
      const response = await fetch(`/api/assets/${imageId}/rate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
      })

      if (!response.ok) {
        throw new Error('Failed to rate image')
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rate image'
      setError(errorMessage)
      return false
    }
  }, [user])

  /**
   * Delete a single image
   */
  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated&apos;)
      return false
    }

    try {
      const response = await fetch(`/api/assets/${imageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image'
      setError(errorMessage)
      return false
    }
  }, [user])

  /**
   * Delete multiple images
   */
  const deleteMultiple = useCallback(async (imageIds: string[]): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    if (imageIds.length === 0) {
      setError('No images selected')
      return false
    }

    try {
      const response = await fetch('/api/assets/delete/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageIds })
      })

      if (!response.ok) {
        throw new Error('Failed to delete images')
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete images'
      setError(errorMessage)
      return false
    }
  }, [user])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Get optimized image URL for different sizes
   */
  const getImageUrl = useCallback((
    image: GalleryImage,
    size: 'original' | 'large' | 'medium' | 'small' = 'original'
  ): string => {
    // If it's a Cloudinary URL, we can add transformation parameters
    if (image.url.includes('cloudinary.com')) {
      const transformations = {
        small: 'w_300,h_300,c_limit,q_auto',
        medium: 'w_600,h_600,c_limit,q_auto',
        large: 'w_1200,h_1200,c_limit,q_auto',
        original: 'q_auto'
      }

      // Insert transformation into URL
      return image.url.replace('/upload/&apos;, `/upload/${transformations[size]}/`)
    }

    // For non-Cloudinary URLs, return as-is
    return image.url
  }, [])

  /**
   * Generate shareable URL for an image
   */
  const generateShareUrl = useCallback((imageId: string): string => {
    if (typeof window !== 'undefined&apos;) {
      return `${window.location.origin}/gallery/${imageId}`
    }
    return ''
  }, [])

  return {
    // Actions
    downloadImage,
    downloadMultiple,
    favoriteImage,
    rateImage,
    deleteImage,
    deleteMultiple,

    // State
    loading,
    error,

    // Utilities
    clearError,
    getImageUrl,
    generateShareUrl
  }
}