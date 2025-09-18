export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProjectWithAssets extends Project {
  asset_count: number
  user_photos: Asset[]
  references: Asset[]
  generated_images: Asset[]
}

export interface Asset {
  id: string
  project_id: string
  user_id: string
  type: 'user_photo' | 'reference' | 'generated'
  url: string
  filename: string | null
  size: number | null
  mime_type: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface CreateProjectData {
  name: string
  description?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
}

export interface ProjectsResponse {
  projects: (Project & { asset_count: number })[]
}

export interface ProjectResponse {
  project: ProjectWithAssets
}

