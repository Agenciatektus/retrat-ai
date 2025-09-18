import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().optional()
})

// GET /api/projects - List user's projects
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/projects',
    },
    async (span) => {
      try {
        const supabase = createClient()

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          span.setAttribute('http.status_code', 401)
          span.setAttribute('error', 'Unauthorized')
          Sentry.logger.warn('Unauthorized access to projects API', { 
            path: '/api/projects',
            authError: authError?.message 
          })
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        span.setAttribute('user.id', user.id)
        span.setAttribute('user.email', user.email || '')

        // Get search parameter
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        
        if (search) {
          span.setAttribute('search.query', search)
        }

        // Build query
        let query = supabase
          .from('projects')
          .select(`
            *,
            assets(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        // Add search filter
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }

        const { data: projectsData, error } = await query

        if (error) {
          span.setAttribute('http.status_code', 500)
          span.setAttribute('error', error.message)
          Sentry.logger.error('Error fetching projects from database', { 
            error: error.message,
            userId: user.id,
            search 
          })
          return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
        }

        // Transform data to include asset count
        const projects = projectsData?.map(project => ({
          ...project,
          asset_count: Array.isArray(project.assets) ? project.assets.length : 0
        })) || []

        span.setAttribute('http.status_code', 200)
        span.setAttribute('projects.count', projects.length)
        
        Sentry.logger.info('Projects fetched successfully', { 
          userId: user.id,
          projectCount: projects.length,
          search 
        })

        return NextResponse.json({ projects })
      } catch (error) {
        span.setAttribute('http.status_code', 500)
        Sentry.logger.error('Unexpected error in GET /api/projects', { error })
        Sentry.captureException(error as Error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
    }
  )
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateProjectSchema.parse(body)

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in POST /api/projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}