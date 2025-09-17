/**
 * Replicate API Service
 *
 * Handles AI image generation using Replicate's API with various SDXL models
 */

import Replicate from 'replicate'
import { z } from 'zod'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// Available models configuration
export const AVAILABLE_MODELS = {
  'sdxl': {
    name: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    description: 'Stable Diffusion XL - High quality, versatile',
    estimated_time: 45,
    max_images: 4
  },
  'sdxl-lightning': {
    name: 'bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f',
    description: 'SDXL Lightning - Ultra fast generation',
    estimated_time: 15,
    max_images: 4
  },
  'flux-1.1-pro': {
    name: 'black-forest-labs/flux-1.1-pro:818ac5ca633ef2c623da7b1d2d22a55ad0b9e4b3a0f09e3dedc5c2fccfbdb2de',
    description: 'Flux 1.1 Pro - Best quality, slower',
    estimated_time: 90,
    max_images: 1
  }
} as const

export type ModelType = keyof typeof AVAILABLE_MODELS

// Input validation schemas
const GenerateImageInputSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  model: z.enum(['sdxl', 'sdxl-lightning', 'flux-1.1-pro']).default('sdxl'),
  num_images: z.number().int().min(1).max(4).default(1),
  width: z.number().int().min(512).max(1024).default(1024),
  height: z.number().int().min(512).max(1024).default(1024),
  guidance_scale: z.number().min(1).max(20).default(7.5),
  num_inference_steps: z.number().int().min(1).max(100).default(30),
  seed: z.number().int().optional(),
  negative_prompt: z.string().optional()
})

const WebhookInputSchema = z.object({
  webhookUrl: z.string().url('Invalid webhook URL')
})

export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>
export type WebhookInput = z.infer<typeof WebhookInputSchema>

export interface GenerationResult {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  urls?: string[]
  error?: string
  created_at: string
  completed_at?: string
  metadata: {
    model: ModelType
    prompt: string
    estimated_time: number
    cost_estimate: number
  }
}

/**
 * Replicate Service Class
 */
export class ReplicateService {
  private defaultNegativePrompt = 'blurry, bad quality, distorted, deformed, duplicate, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, low quality, worst quality, bad hands, bad fingers, missing fingers, jpeg artifacts, signature, watermark, username, text'

  /**
   * Generate images using Replicate API
   */
  async generateImages(input: GenerateImageInput, webhookUrl?: string): Promise<GenerationResult> {
    // Validate input
    const validatedInput = GenerateImageInputSchema.parse(input)
    const modelConfig = AVAILABLE_MODELS[validatedInput.model]

    // Ensure num_images doesn't exceed model limit
    const numImages = Math.min(validatedInput.num_images, modelConfig.max_images)

    try {
      // Prepare model inputs based on the selected model
      const modelInputs = this.prepareModelInputs(validatedInput, numImages)

      // Start prediction
      const prediction = await replicate.predictions.create({
        version: modelConfig.name,
        input: modelInputs,
        webhook: webhookUrl ? { url: webhookUrl, events: ['completed'] } : undefined
      })

      // Calculate cost estimate (rough approximation)
      const costEstimate = this.calculateCostEstimate(validatedInput.model, numImages)

      return {
        id: prediction.id,
        status: prediction.status as GenerationResult['status'],
        urls: prediction.output as string[] | undefined,
        created_at: prediction.created_at,
        completed_at: prediction.completed_at || undefined,
        metadata: {
          model: validatedInput.model,
          prompt: validatedInput.prompt,
          estimated_time: modelConfig.estimated_time,
          cost_estimate: costEstimate
        }
      }
    } catch (error) {
      console.error('Replicate generation error:', error)
      throw new Error(`Failed to start image generation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check the status of a generation
   */
  async getGenerationStatus(predictionId: string): Promise<GenerationResult> {
    try {
      const prediction = await replicate.predictions.get(predictionId)

      return {
        id: prediction.id,
        status: prediction.status as GenerationResult['status'],
        urls: prediction.output as string[] | undefined,
        error: prediction.error as string | undefined,
        created_at: prediction.created_at,
        completed_at: prediction.completed_at || undefined,
        metadata: {
          model: 'sdxl', // Default fallback, should be stored in database
          prompt: 'Unknown', // Should be retrieved from database
          estimated_time: 45,
          cost_estimate: 0.01
        }
      }
    } catch (error) {
      console.error('Error fetching prediction status:', error)
      throw new Error(`Failed to get generation status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Cancel a running generation
   */
  async cancelGeneration(predictionId: string): Promise<boolean> {
    try {
      await replicate.predictions.cancel(predictionId)
      return true
    } catch (error) {
      console.error('Error canceling prediction:', error)
      return false
    }
  }

  /**
   * Prepare model-specific inputs
   */
  private prepareModelInputs(input: GenerateImageInput, numImages: number): Record<string, unknown> {
    const baseInputs = {
      prompt: input.prompt,
      num_outputs: numImages,
      width: input.width,
      height: input.height,
      guidance_scale: input.guidance_scale,
      num_inference_steps: input.num_inference_steps,
      negative_prompt: input.negative_prompt || this.defaultNegativePrompt
    }

    // Add seed if provided
    if (input.seed !== undefined) {
      baseInputs.seed = input.seed
    }

    // Model-specific adjustments
    switch (input.model) {
      case 'sdxl-lightning':
        return {
          ...baseInputs,
          num_inference_steps: 4, // Lightning models use 4 steps
          guidance_scale: 1.0 // Lightning models work better with lower guidance
        }

      case 'flux-1.1-pro':
        return {
          prompt: input.prompt,
          width: input.width,
          height: input.height,
          steps: input.num_inference_steps,
          guidance: input.guidance_scale,
          seed: input.seed,
          safety_tolerance: 2 // Flux-specific parameter
        }

      default: // sdxl
        return baseInputs
    }
  }

  /**
   * Calculate rough cost estimate
   */
  private calculateCostEstimate(model: ModelType, numImages: number): number {
    const baseCosts = {
      'sdxl': 0.0035,
      'sdxl-lightning': 0.0015,
      'flux-1.1-pro': 0.015
    }

    return baseCosts[model] * numImages
  }

  /**
   * Get available models info
   */
  getAvailableModels(): typeof AVAILABLE_MODELS {
    return AVAILABLE_MODELS
  }

  /**
   * Optimize prompt for better results
   */
  optimizePrompt(originalPrompt: string, model: ModelType): string {
    let optimizedPrompt = originalPrompt

    // Add model-specific optimizations
    switch (model) {
      case 'flux-1.1-pro':
        // Flux works better with more detailed prompts
        if (!optimizedPrompt.includes('high quality') && !optimizedPrompt.includes('detailed')) {
          optimizedPrompt += ', highly detailed, high quality'
        }
        break

      case 'sdxl-lightning':
        // Lightning models work better with simpler prompts
        optimizedPrompt = optimizedPrompt
          .replace(/,\s*(highly detailed|ultra detailed|intricate details?)/gi, '')
          .replace(/,\s*high quality/gi, '')
        break

      default:
        // SDXL standard optimizations
        if (!optimizedPrompt.includes('professional photography')) {
          optimizedPrompt += ', professional photography'
        }
        break
    }

    return optimizedPrompt.trim()
  }

  /**
   * Validate that Replicate API is accessible
   */
  async validateConnection(): Promise<boolean> {
    try {
      const account = await replicate.accounts.current()
      return !!account
    } catch (error) {
      console.error('Replicate connection validation failed:', error)
      return false
    }
  }

  /**
   * Get generation history (requires database integration)
   */
  async getGenerationHistory(userId: string, limit: number = 20): Promise<GenerationResult[]> {
    // This would typically query the database for user's generation history
    // For now, returning empty array as placeholder
    return []
  }

  /**
   * Estimate cost for a generation before starting
   */
  estimateGenerationCost(model: ModelType, numImages: number): {
    cost: number
    currency: string
    breakdown: {
      base_cost: number
      images: number
      total: number
    }
  } {
    const baseCost = this.calculateCostEstimate(model, 1)
    const totalCost = baseCost * numImages

    return {
      cost: totalCost,
      currency: 'USD',
      breakdown: {
        base_cost: baseCost,
        images: numImages,
        total: totalCost
      }
    }
  }
}