"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Project, ProjectWithAssets, CreateProjectData, UpdateProjectData } from '@/lib/types/projects'

export function useProjects() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<(Project & { asset_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async (search?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/projects?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data.projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      const result = await response.json()
      
      // Refresh projects list
      await fetchProjects()
      
      return result.project
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error&apos;)
      return null
    }
  }

  const updateProject = async (id: string, data: UpdateProjectData): Promise<Project | null> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update project')
      }

      const result = await response.json()
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, ...result.project } : p
      ))
      
      return result.project
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error&apos;)
      return null
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete project')
      }

      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error&apos;)
      return false
    }
  }

  useEffect(() => {
    // Only fetch projects when user is authenticated and auth is not loading
    if (!authLoading && user) {
      fetchProjects()
    } else if (!authLoading && !user) {
      // User is not authenticated, set loading to false
      setLoading(false)
      setProjects([])
    }
  }, [user, authLoading])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithAssets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/projects/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found')
        }
        throw new Error('Failed to fetch project')
      }
      
      const data = await response.json()
      setProject(data.project)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
  }
}
