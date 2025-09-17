import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DiretorVisual } from '@/lib/agents/director-visual'
import { ReplicateService } from '@/lib/services/replicate'
import { billingService } from '@/lib/services/billing'
import { z } from 'zod'

const GenerateRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  referenceImageIds: z.array(z.string().uuid()).min(1, 'At least one reference image required').max(3, 'Maximum 3 reference images'),
  userPhotoIds: z.array(z.string().uuid()).min(1, 'At least one user photo required').max(5, 'Maximum 5 user photos'),
  model: z.enum(['sdxl', 'sdxl-lightning', 'flux-1.1-pro']).optional().default('sdxl'),
  numImages: z.number().int().min(1).max(4).optional().default(1),
  style: z.enum(['editorial', 'fashion', 'lifestyle', 'portrait', 'casual', 'vintage', 'surreal']).optional(),
  mood: z.enum(['confident', 'relaxed', 'dramatic', 'playful', 'elegant', 'moody', 'bright']).optional(),
  additionalInstructions: z.string().optional()
})

// POST /api/generate - Start AI generation
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = GenerateRequestSchema.parse(body)

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', validatedData.projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if user can generate (billing quota check)
    const canGenerate = await billingService.canUserGenerate(user.id)
    if (!canGenerate) {
      const billingInfo = await billingService.getBillingInfo(user.id)
      return NextResponse.json({
        error: 'Generation quota exceeded',
        details: {
          current_usage: billingInfo.currentUsage?.generations_used || 0,
          quota_remaining: billingInfo.quotaRemaining,
          subscription: billingInfo.subscription?.plan?.name || 'Free'
        }
      }, { status: 429 })
    }

    // Get reference images and user photos
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, type, url, filename')
      .eq('project_id', validatedData.projectId)
      .eq('user_id', user.id)
      .in('id', [...validatedData.referenceImageIds, ...validatedData.userPhotoIds])

    if (assetsError || !assets) {
      return NextResponse.json({ error: 'Failed to get assets' }, { status: 500 })
    }

    // Separate reference images and user photos
    const referenceImages = assets.filter(asset =>
      validatedData.referenceImageIds.includes(asset.id) && asset.type === 'reference'
    )
    const userPhotos = assets.filter(asset =>
      validatedData.userPhotoIds.includes(asset.id) && asset.type === 'user_photo'
    )

    if (referenceImages.length === 0 || userPhotos.length === 0) {
      return NextResponse.json({
        error: 'Required assets not found',
        details: {
          references_found: referenceImages.length,
          user_photos_found: userPhotos.length
        }
      }, { status: 400 })
    }

    // Initialize DiretorVisual agent
    const directorVisual = new DiretorVisual()

    // Use the first reference image for now (could be enhanced to analyze multiple)
    const primaryReference = referenceImages[0]

    // Analyze images and generate prompt
    const promptAnalysis = await directorVisual.analyzeAndGeneratePrompt({
      referenceImageUrl: primaryReference.url,
      userPhotoUrls: userPhotos.map(photo => photo.url),
      additionalInstructions: validatedData.additionalInstructions,
      style: validatedData.style,
      mood: validatedData.mood
    })

    // Initialize Replicate service
    const replicateService = new ReplicateService()

    // Optimize prompt for the selected model
    const optimizedPrompt = replicateService.optimizePrompt(promptAnalysis.prompt, validatedData.model)

    // Create webhook URL for async results
    const webhookUrl = `${request.nextUrl.origin}/api/webhooks/replicate`

    // Start generation
    const generationResult = await replicateService.generateImages({
      prompt: optimizedPrompt,
      model: validatedData.model,
      num_images: validatedData.numImages,
      width: 1024,
      height: 1024,
      guidance_scale: 7.5,
      num_inference_steps: validatedData.model === 'sdxl-lightning' ? 4 : 30
    }, webhookUrl)

    // Save generation record to database
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .insert({
        project_id: validatedData.projectId,
        user_id: user.id,
        status: generationResult.status,
        prompt: optimizedPrompt,
        metadata: {
          model: validatedData.model,
          reference_images: referenceImages.map(img => ({ id: img.id, url: img.url })),
          user_photos: userPhotos.map(photo => ({ id: photo.id, url: photo.url })),
          replicate_id: generationResult.id,
          num_images: validatedData.numImages,
          estimated_time: generationResult.metadata.estimated_time,
          cost_estimate: generationResult.metadata.cost_estimate,
          prompt_analysis: promptAnalysis.analysis
        }
      })
      .select()
      .single()

    if (generationError) {
      console.error('Failed to save generation record:', generationError)
      // Continue anyway, don't fail the request
    }

    // Increment usage count
    try {
      await billingService.incrementUsage(user.id)
    } catch (usageError) {
      console.error('Failed to increment usage:', usageError)
      // Continue anyway, don't fail the request
    }

    // Return generation details
    return NextResponse.json({
      success: true,
      generation: {
        id: generation?.id || generationResult.id,
        replicate_id: generationResult.id,
        status: generationResult.status,
        prompt: optimizedPrompt,
        estimated_completion: new Date(Date.now() + generationResult.metadata.estimated_time * 1000),
        metadata: {
          model: validatedData.model,
          num_images: validatedData.numImages,
          estimated_time: generationResult.metadata.estimated_time,
          cost_estimate: generationResult.metadata.cost_estimate
        }
      },
      usage: {
        current: currentUsage + 1,
        limit: quotaLimit,
        remaining: quotaLimit - (currentUsage + 1)
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in POST /api/generate:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/generate/[id] - Check generation status (implemented in separate file)
// This would go in /api/generate/[id]/route.ts