"use client"

import { useState, useEffect } from 'react'
import { Asset } from '@/lib/types/projects'

export function useAssets(projectId: string, type?: 'user_photo' | 'reference' | 'generated') {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (type) params.append('type', type)
      
      const response = await fetch(`/api/projects/${projectId}/assets?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets')
      }
      
      const data = await response.json()
      setAssets(data.assets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const deleteAsset = async (assetId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete asset')
      }

      // Remove from local state
      setAssets(prev => prev.filter(asset => asset.id !== assetId))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  const addAssets = (newAssets: Asset[]) => {
    setAssets(prev => [...newAssets, ...prev])
  }

  useEffect(() => {
    if (projectId) {
      fetchAssets()
    }
  }, [projectId, type])

  return {
    assets,
    loading,
    error,
    fetchAssets,
    deleteAsset,
    addAssets,
    refetch: fetchAssets,
  }
}
