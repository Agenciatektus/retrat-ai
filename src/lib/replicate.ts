import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export interface GenerationRequest {
  prompt: string
  userImageUrl: string
  referenceImageUrl?: string
  model?: string
  webhookUrl?: string
}

export interface GenerationResult {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string[]
  error?: string
  urls?: {
    get: string
    cancel: string
  }
}

/**
 * Start image generation using Replicate API
 * Following the EP-005 specifications for AI generation pipeline
 */
export async function startGeneration(request: GenerationRequest): Promise<GenerationResult> {
  try {
    // Use SDXL model with IP-Adapter for style transfer
    // This model is good for portrait generation with style reference
    const model = request.model || "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
    
    const input = {
      prompt: request.prompt,
      image: request.userImageUrl,
      // Add reference image if provided
      ...(request.referenceImageUrl && {
        style_reference: request.referenceImageUrl,
        style_strength: 0.7, // Balance between user features and reference style
      }),
      // Quality settings
      width: 1024,
      height: 1024,
      num_outputs: 1,
      scheduler: "K_EULER",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      // Ensure high quality
      high_noise_frac: 0.8,
    }

    // Create prediction with webhook if provided
    const prediction = await replicate.predictions.create({
      version: model,
      input,
      ...(request.webhookUrl && {
        webhook: request.webhookUrl,
        webhook_events_filter: ["start", "output", "logs", "completed"],
      }),
    })

    return {
      id: prediction.id,
      status: prediction.status as 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled',
      output: prediction.output as string[],
      error: prediction.error,
      urls: prediction.urls,
    }
  } catch (error) {
    console.error('Replicate generation error:', error)
    throw new Error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get generation status and results
 */
export async function getGeneration(id: string): Promise<GenerationResult> {
  try {
    const prediction = await replicate.predictions.get(id)
    
    return {
      id: prediction.id,
      status: prediction.status as 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled',
      output: prediction.output as string[],
      error: prediction.error,
      urls: prediction.urls,
    }
  } catch (error) {
    console.error('Error getting generation:', error)
    throw new Error(`Failed to get generation: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Cancel ongoing generation
 */
export async function cancelGeneration(id: string): Promise<void> {
  try {
    await replicate.predictions.cancel(id)
  } catch (error) {
    console.error('Error canceling generation:', error)
    throw new Error(`Failed to cancel generation: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default replicate
