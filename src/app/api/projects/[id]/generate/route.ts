import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startGeneration } from '@/lib/replicate'
import { directorVisual } from '@/lib/ai/director-visual'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const generateSchema = z.object({
  userPhotoIds: z.array(z.string()).min(1, 'At least one user photo is required'),
  referenceId: z.string().min(1, 'Reference image is required'),
  customInstructions: z.string().optional(),
})

// POST /api/projects/[id]/generate - Start AI generation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project exists and belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Parse and validate request
    const body = await request.json()
    const { userPhotoIds, referenceId, customInstructions } = generateSchema.parse(body)

    // Get user photos and reference image
    const { data: userPhotos, error: userPhotosError } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', params.id)
      .eq('user_id', user.id)
      .eq('type', 'user_photo')
      .in('id', userPhotoIds)

    const { data: reference, error: referenceError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', referenceId)
      .eq('project_id', params.id)
      .eq('user_id', user.id)
      .eq('type', 'reference')
      .single()

    if (userPhotosError || !userPhotos?.length) {
      return NextResponse.json({ error: 'User photos not found' }, { status: 404 })
    }

    if (referenceError || !reference) {
      return NextResponse.json({ error: 'Reference image not found' }, { status: 404 })
    }

    // Check user quota (for free users)
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single()

      if (profile?.plan === 'free') {
        // Check monthly usage
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
        const { data: usage } = await supabase
          .from('usage')
          .select('generation_count, quota_limit')
          .eq('user_id', user.id)
          .eq('month', currentMonth)
          .single()

        if (usage && usage.generation_count >= usage.quota_limit) {
          return NextResponse.json({ 
            error: 'Monthly quota exceeded. Upgrade to Pro for unlimited generations.',
            code: 'QUOTA_EXCEEDED'
          }, { status: 429 })
        }
      }
    }

    // Use DiretorVisual agent to analyze and generate prompt
    const promptResult = await directorVisual.analyzeAndGeneratePrompt(
      reference,
      userPhotos,
      customInstructions
    )

    // Create generation record in database
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .insert({
        project_id: params.id,
        user_id: user.id,
        status: 'pending',
        prompt: promptResult.prompt,
        metadata: {
          analysis: promptResult.analysis,
          confidence: promptResult.confidence,
          user_photo_ids: userPhotoIds,
          reference_id: referenceId,
          custom_instructions: customInstructions,
        },
      })
      .select()
      .single()

    if (generationError) {
      console.error('Error creating generation record:', generationError)
      return NextResponse.json({ error: 'Failed to create generation' }, { status: 500 })
    }

    // Start generation with Replicate
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`
    
    try {
      const replicateResult = await startGeneration({
        prompt: promptResult.prompt,
        userImageUrl: userPhotos[0].url, // Use first user photo as primary
        referenceImageUrl: reference.url,
        webhookUrl,
      })

      // Update generation with Replicate ID
      await supabase
        .from('generations')
        .update({
          status: 'processing',
          metadata: {
            ...generation.metadata,
            replicate_id: replicateResult.id,
            replicate_urls: replicateResult.urls,
          },
        })
        .eq('id', generation.id)

      // Update usage count for free users
      if (user) {
        const currentMonth = new Date().toISOString().slice(0, 7)
        await supabase.rpc('increment_usage', {
          p_user_id: user.id,
          p_month: currentMonth,
        })
      }

      return NextResponse.json({
        generation: {
          id: generation.id,
          status: 'processing',
          prompt: promptResult.prompt,
          analysis: promptResult.analysis,
          replicate_id: replicateResult.id,
        },
      }, { status: 201 })

    } catch (replicateError) {
      console.error('Replicate error:', replicateError)
      
      // Update generation status to failed
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: replicateError instanceof Error ? replicateError.message : 'Unknown error',
        })
        .eq('id', generation.id)

      return NextResponse.json({ 
        error: 'Failed to start AI generation',
        details: replicateError instanceof Error ? replicateError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Unexpected error in POST /api/projects/[id]/generate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
