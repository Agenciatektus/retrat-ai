"use client"

import { useState, useEffect, useCallback } from 'react'

export interface GenerationStatus {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  estimated_completion?: string
  progress?: number
  error?: string
}

export interface UsageStats {
  current: number
  limit: number
  plan: 'free' | 'pro'
}

export interface GenerationRequest {
  projectId: string
  referenceImageIds: string[]
  userPhotoIds: string[]
  model: string
  numImages: number
  style: string
}

export function useGeneration() {
  const [currentGeneration, setCurrentGeneration] = useState<GenerationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)

  const startGeneration = async (request: GenerationRequest): Promise<GenerationStatus | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/projects/${request.projectId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json&apos;,
        },
        body: JSON.stringify({
          userPhotoIds: request.userPhotoIds,
          referenceId: request.referenceImageIds[0], // Use first reference
          customInstructions: `Style: ${request.style}, Model: ${request.model}`,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start generation')
      }

      const generation: GenerationStatus = {
        id: result.generation.id,
        status: 'starting',
        estimated_completion: new Date(Date.now() + 90000).toISOString(), // 90 seconds from now
      }

      setCurrentGeneration(generation)
      
      // Start polling for updates
      pollGenerationStatus(generation.id)
      
      return generation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const pollGenerationStatus = useCallback((generationId: string) => {
    const interval = setInterval(async () => {
      try {
        // For now, simulate status updates since we don't have the full API yet
        setCurrentGeneration(prev => {
          if (!prev) return null
          
          if (prev.status === 'starting') {
            return { ...prev, status: 'processing', progress: 30 }
          }
          if (prev.status === 'processing') {
            return { ...prev, status: 'succeeded', progress: 100 }
          }
          
          return prev
        })
      } catch (error) {
        console.error('Error polling generation status:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Cleanup after 2 minutes
    setTimeout(() => clearInterval(interval), 2 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const canGenerate = useCallback((): boolean => {
    if (!usage) return true // Assume can generate if usage not loaded
    if (usage.plan === 'pro') return true
    return usage.current < usage.limit
  }, [usage])

  const isGenerationComplete = useCallback((status: string): boolean => {
    return status === 'succeeded' || status === 'failed' || status === 'canceled'
  }, [])

  // Load usage stats on mount
  useEffect(() => {
    const loadUsage = async () => {
      try {
        // Mock usage for now - replace with real API call
        setUsage({
          current: 2,
          limit: 5,
          plan: 'free',
        })
      } catch (error) {
        console.error('Error loading usage:', error)
      }
    }

    loadUsage()
  }, [])

  return {
    currentGeneration,
    loading,
    error,
    usage,
    startGeneration,
    canGenerate,
    isGenerationComplete,
  }
}