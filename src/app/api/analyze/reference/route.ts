import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { photographyAnalyzer } from '@/lib/agents/photography-analyzer'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const AnalyzeRequestSchema = z.object({
  imageUrl: z.string().url(),
  projectId: z.string().uuid(),
  userContext: z.string().optional(),
  generateVariations: z.boolean().default(false)
})

// POST /api/analyze/reference - Analyze reference image for photography patterns
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const body = await request.json()
    const { imageUrl, projectId, userContext, generateVariations } = AnalyzeRequestSchema.parse(body)

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Analyze the reference image
    const analysis = await photographyAnalyzer.analyzeReference(imageUrl, userContext)

    // Generate style variations if requested
    let variations = undefined
    if (generateVariations) {
      variations = photographyAnalyzer.generateStyleVariations(analysis)
    }

    // Get suggestions for improvement
    const suggestions = photographyAnalyzer.suggestPromptImprovements(analysis)

    // Store analysis in database for future reference
    const { error: insertError } = await supabase
      .from('reference_analyses')
      .insert({
        project_id: projectId,
        user_id: user.id,
        image_url: imageUrl,
        analysis: analysis,
        master_prompt: analysis.masterPrompt,
        confidence_score: analysis.confidence,
        user_context: userContext
      })

    if (insertError) {
      console.error('Error storing analysis:', insertError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      analysis,
      variations,
      suggestions,
      success: true
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/analyze/reference:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze reference' },
      { status: 500 }
    )
  }
}

// GET /api/analyze/reference - Get previous analyses for a project
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get analyses for the project
    const { data: analyses, error } = await supabase
      .from('reference_analyses')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching analyses:', error)
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }

    return NextResponse.json({ analyses })

  } catch (error) {
    console.error('Error in GET /api/analyze/reference:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    )
  }
}
