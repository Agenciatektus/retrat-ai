import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Replicate webhook payload schema
const ReplicateWebhookSchema = z.object({
  id: z.string(),
  version: z.string(),
  created_at: z.string(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  status: z.enum(['starting', 'processing', 'succeeded', 'failed', 'canceled']),
  input: z.record(z.any()),
  output: z.union([z.array(z.string()), z.null()]).optional(),
  error: z.string().optional(),
  logs: z.string().optional(),
  metrics: z.object({
    predict_time: z.number().optional(),
  }).optional()
})

// POST /api/webhooks/replicate - Handle Replicate webhook
export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const body = await request.json()
    const webhook = ReplicateWebhookSchema.parse(body)

    console.log('Received Replicate webhook:', {
      id: webhook.id,
      status: webhook.status,
      hasOutput: !!webhook.output
    })

    // Create Supabase client with service role for webhook operations
    const supabase = createClient()

    // Find generation record by replicate_id
    const { data: generation, error: findError } = await supabase
      .from('generations')
      .select(`
        id,
        project_id,
        user_id,
        status,
        metadata
      `)
      .eq('metadata->>replicate_id', webhook.id)
      .single()

    if (findError || !generation) {
      console.error('Generation not found for webhook:', webhook.id, findError)
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status: webhook.status,
      completed_at: webhook.completed_at || new Date().toISOString(),
    }

    // Handle successful generation
    if (webhook.status === 'succeeded' && webhook.output) {
      updateData.output_url = JSON.stringify(webhook.output)

      try {
        // Save generated images as assets
        const assetPromises = webhook.output.map((url, index) =>
          supabase.from('assets').insert({
            project_id: generation.project_id,
            user_id: generation.user_id,
            type: 'generated',
            url: url,
            filename: `generated_${generation.id}_${index + 1}.jpg`,
            size: null, // Will be filled later if needed
            mime_type: 'image/jpeg',
            metadata: {
              generation_id: generation.id,
              model: generation.metadata?.model || 'unknown',
              replicate_id: webhook.id,
              prompt: generation.metadata?.prompt || '',
              generation_metrics: webhook.metrics
            }
          })
        )

        const assetResults = await Promise.allSettled(assetPromises)
        const failedAssets = assetResults.filter(result => result.status === 'rejected')

        if (failedAssets.length > 0) {
          console.error('Some assets failed to save:', failedAssets)
        }

        console.log(`Saved ${webhook.output.length - failedAssets.length}/${webhook.output.length} generated images`)

      } catch (assetError) {
        console.error('Error saving generated assets:', assetError)
        // Continue with generation update even if asset saving fails
      }
    }

    // Handle failed generation
    if (webhook.status === 'failed') {
      updateData.error_message = webhook.error || 'Generation failed without specific error message'
      console.error('Generation failed:', webhook.id, webhook.error)
    }

    // Update generation record
    const { error: updateError } = await supabase
      .from('generations')
      .update(updateData)
      .eq('id', generation.id)

    if (updateError) {
      console.error('Error updating generation:', updateError)
      return NextResponse.json({ error: 'Failed to update generation' }, { status: 500 })
    }

    // Log successful webhook processing
    console.log('Successfully processed webhook:', {
      generation_id: generation.id,
      replicate_id: webhook.id,
      status: webhook.status,
      images_count: webhook.output?.length || 0
    })

    return NextResponse.json({
      success: true,
      generation_id: generation.id,
      status: webhook.status
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid webhook payload:', error.errors)
      return NextResponse.json({
        error: 'Invalid webhook payload',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error processing Replicate webhook:', error)
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/webhooks/replicate - Webhook endpoint verification (for some webhook providers)
export async function GET(request: NextRequest) {
  // Some webhook providers require GET endpoint verification
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')

  if (challenge) {
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({
    message: 'Replicate webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}