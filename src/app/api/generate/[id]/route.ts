import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReplicateService } from '@/lib/services/replicate'

// GET /api/generate/[id] - Check generation status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get generation record from database
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .select(`
        *,
        projects!inner(id, name, user_id)
      `)
      .eq('id', params.id)
      .single()

    if (generationError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    // Verify user ownership
    if (generation.projects.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If generation is completed, return cached result
    if (generation.status === 'completed' && generation.output_url) {
      return NextResponse.json({
        id: generation.id,
        status: generation.status,
        prompt: generation.prompt,
        urls: JSON.parse(generation.output_url),
        created_at: generation.created_at,
        completed_at: generation.completed_at,
        metadata: generation.metadata
      })
    }

    // If generation is failed, return error details
    if (generation.status === 'failed') {
      return NextResponse.json({
        id: generation.id,
        status: generation.status,
        error: generation.error_message || 'Generation failed',
        created_at: generation.created_at,
        completed_at: generation.completed_at,
        metadata: generation.metadata
      })
    }

    // For pending/processing status, check with Replicate API
    if (generation.metadata?.replicate_id) {
      try {
        const replicateService = new ReplicateService()
        const replicateStatus = await replicateService.getGenerationStatus(generation.metadata.replicate_id)

        // Update database if status changed
        if (replicateStatus.status !== generation.status) {
          const updateData: Record<string, unknown> = {
            status: replicateStatus.status,
          }

          if (replicateStatus.status === 'succeeded' && replicateStatus.urls) {
            updateData.output_url = JSON.stringify(replicateStatus.urls)
            updateData.completed_at = new Date().toISOString()

            // Save generated images as assets
            const assetPromises = replicateStatus.urls.map((url, index) =>
              supabase.from('assets').insert({
                project_id: generation.project_id,
                user_id: user.id,
                type: 'generated',
                url: url,
                filename: `generated_${generation.id}_${index + 1}.jpg`,
                metadata: {
                  generation_id: generation.id,
                  model: generation.metadata.model,
                  prompt: generation.prompt
                }
              })
            )

            await Promise.all(assetPromises)
          } else if (replicateStatus.status === 'failed') {
            updateData.error_message = replicateStatus.error || 'Generation failed'
            updateData.completed_at = new Date().toISOString()
          }

          // Update generation record
          const { data: updatedGeneration } = await supabase
            .from('generations')
            .update(updateData)
            .eq('id', generation.id)
            .select()
            .single()

          if (updatedGeneration) {
            generation.status = updatedGeneration.status
            generation.output_url = updatedGeneration.output_url
            generation.completed_at = updatedGeneration.completed_at
            generation.error_message = updatedGeneration.error_message
          }
        }

        return NextResponse.json({
          id: generation.id,
          status: replicateStatus.status,
          prompt: generation.prompt,
          urls: replicateStatus.urls,
          error: replicateStatus.error,
          created_at: generation.created_at,
          completed_at: replicateStatus.completed_at || generation.completed_at,
          estimated_completion: generation.status === 'processing'
            ? new Date(Date.now() + 30000) // Estimate 30s remaining
            : undefined,
          metadata: generation.metadata
        })

      } catch (replicateError) {
        console.error('Error checking Replicate status:', replicateError)
        // Fall back to database status
      }
    }

    // Return current database status
    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      prompt: generation.prompt,
      urls: generation.output_url ? JSON.parse(generation.output_url) : undefined,
      error: generation.error_message,
      created_at: generation.created_at,
      completed_at: generation.completed_at,
      metadata: generation.metadata
    })

  } catch (error) {
    console.error('Error in GET /api/generate/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/generate/[id] - Cancel generation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get generation record
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .select(`
        *,
        projects!inner(id, name, user_id)
      `)
      .eq('id', params.id)
      .single()

    if (generationError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    // Verify user ownership
    if (generation.projects.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Can only cancel pending or processing generations
    if (!['pending', 'processing'].includes(generation.status)) {
      return NextResponse.json({
        error: 'Cannot cancel generation',
        details: `Generation is ${generation.status}`
      }, { status: 400 })
    }

    // Try to cancel with Replicate if we have the ID
    let canceledWithReplicate = false
    if (generation.metadata?.replicate_id) {
      try {
        const replicateService = new ReplicateService()
        canceledWithReplicate = await replicateService.cancelGeneration(generation.metadata.replicate_id)
      } catch (error) {
        console.error('Error canceling with Replicate:', error)
        // Continue with database update even if Replicate cancel fails
      }
    }

    // Update generation status to canceled
    const { error: updateError } = await supabase
      .from('generations')
      .update({
        status: 'canceled',
        completed_at: new Date().toISOString(),
        error_message: 'Canceled by user'
      })
      .eq('id', generation.id)

    if (updateError) {
      console.error('Error updating generation status:', updateError)
      return NextResponse.json({ error: 'Failed to cancel generation' }, { status: 500 })
    }

    // Update usage count (reduce by 1 since generation was canceled)
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: usage } = await supabase
      .from('usage')
      .select('generation_count')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    if (usage && usage.generation_count > 0) {
      await supabase
        .from('usage')
        .update({ generation_count: usage.generation_count - 1 })
        .eq('user_id', user.id)
        .eq('month', currentMonth)
    }

    return NextResponse.json({
      success: true,
      message: 'Generation canceled',
      canceled_with_replicate: canceledWithReplicate
    })

  } catch (error) {
    console.error('Error in DELETE /api/generate/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}