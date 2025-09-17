"use client"

import { useState, useCallback } from 'react'

export interface FileUploadResult {
  success: boolean
  files: Array<{
    id: string
    url: string
    filename: string
  }>
  errors: string[]
}

export interface UseFileUploadOptions {
  projectId: string
  type: 'user_photo' | 'reference'
  onSuccess?: (assets: unknown[]) => void
  onError?: (error: string) => void
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFiles = useCallback(async (files: File[]): Promise<FileUploadResult> => {
    if (!options) {
      throw new Error('useFileUpload requires options when called')
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('type', options.type)
      
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/projects/${options.projectId}/assets`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      if (options.onSuccess) {
        options.onSuccess(result.uploaded || [])
      }

      return {
        success: true,
        files: result.uploaded || [],
        errors: result.errors || [],
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      
      if (options.onError) {
        options.onError(errorMessage)
      }

      return {
        success: false,
        files: [],
        errors: [errorMessage],
      }
    } finally {
      setUploading(false)
    }
  }, [options])

  return {
    uploading,
    error,
    uploadFiles,
  }
}