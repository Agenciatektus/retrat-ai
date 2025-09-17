"use client"

import { useState, useEffect } from 'react'

export interface Generation {
  id: string
  project_id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prompt: string
  output_url: string | null
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
  completed_at: string | null
}

export interface GenerationRequest {
  userPhotoIds: string[]
  referenceId: string
  customInstructions?: string
}

export function useGenerations(projectId: string) {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const fetchGenerations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/projects/${projectId}/generations`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch generations')
      }
      
      const data = await response.json()
      setGenerations(data.generations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const startGeneration = async (request: GenerationRequest): Promise<Generation | null> => {
    try {
      setGenerating(true)
      setError(null)
      
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start generation')
      }

      // Refresh generations list
      await fetchGenerations()
      
      return result.generation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setGenerating(false)
    }
  }

  const pollGenerationStatus = (generationId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/generations/${generationId}`)
        if (response.ok) {
          const data = await response.json()
          const generation = data.generation
          
          // Update local state
          setGenerations(prev => prev.map(gen => 
            gen.id === generationId ? generation : gen
          ))
          
          // Stop polling if completed or failed
          if (generation.status === 'completed' || generation.status === 'failed') {
            clearInterval(interval)
          }
        }
      } catch (error) {
        console.error('Error polling generation status:', error)
      }
    }, 3000) // Poll every 3 seconds

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }

  useEffect(() => {
    if (projectId) {
      fetchGenerations()
    }
  }, [projectId])

  return {
    generations,
    loading,
    error,
    generating,
    fetchGenerations,
    startGeneration,
    pollGenerationStatus,
    refetch: fetchGenerations,
  }
}

export function useGeneration(generationId: string) {
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGeneration = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/generations/${generationId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch generation')
      }
      
      const data = await response.json()
      setGeneration(data.generation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (generationId) {
      fetchGeneration()
    }
  }, [generationId])

  return {
    generation,
    loading,
    error,
    refetch: fetchGeneration,
  }
}
