/**
 * DiretorVisual Agent - Visual Director for Photographic Shoots
 *
 * This agent analyzes reference images and user photos to generate
 * highly technical, photorealistic prompts for AI image generation.
 */

import { z } from 'zod'

// Input validation schemas
const AnalyzeImagesInputSchema = z.object({
  referenceImageUrl: z.string().url('Invalid reference image URL'),
  userPhotoUrls: z.array(z.string().url()).min(1, 'At least one user photo required').max(5, 'Maximum 5 user photos'),
  additionalInstructions: z.string().optional(),
  style: z.enum(['editorial', 'fashion', 'lifestyle', 'portrait', 'casual', 'vintage', 'surreal']).optional(),
  mood: z.enum(['confident', 'relaxed', 'dramatic', 'playful', 'elegant', 'moody', 'bright']).optional()
})

const ImageAnalysisSchema = z.object({
  lighting: z.object({
    type: z.enum(['soft', 'hard', 'mixed']),
    direction: z.enum(['front', 'side', 'back', 'top', 'bottom', 'window-light']),
    quality: z.enum(['diffused', 'direct', 'natural', 'studio', 'golden-hour', 'blue-hour']),
    temperature: z.enum(['warm', 'cool', 'neutral'])
  }),
  composition: z.object({
    angle: z.enum(['eye-level', 'low-angle', 'high-angle', 'dutch-angle']),
    framing: z.enum(['close-up', 'medium-shot', 'full-body', 'three-quarter']),
    orientation: z.enum(['portrait', 'landscape', 'square']),
    rule_of_thirds: z.boolean()
  }),
  camera: z.object({
    focal_length: z.string(), // e.g., "85mm", "50mm"
    aperture: z.string(), // e.g., "f/1.8", "f/2.8"
    depth_of_field: z.enum(['shallow', 'medium', 'deep'])
  }),
  style: z.object({
    type: z.enum(['editorial', 'fashion', 'lifestyle', 'portrait', 'casual', 'vintage', 'surreal']),
    era: z.string().optional(), // e.g., "modern", "90s", "vintage"
    aesthetic: z.string() // e.g., "minimalist", "maximalist", "bohemian"
  }),
  subject: z.object({
    pose: z.string(),
    expression: z.string(),
    gaze_direction: z.enum(['camera', 'away', 'down', 'up', 'side']),
    clothing_style: z.string(),
    hair_description: z.string()
  }),
  environment: z.object({
    background_type: z.enum(['studio', 'outdoor', 'indoor', 'urban', 'natural']),
    background_description: z.string(),
    props: z.array(z.string()).optional()
  }),
  color_palette: z.array(z.string()),
  mood: z.string()
})

export type AnalyzeImagesInput = z.infer<typeof AnalyzeImagesInputSchema>
export type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>

export interface GeneratedPrompt {
  prompt: string
  analysis: {
    reference: ImageAnalysis
    userPhotos: Array<{
      url: string
      description: string
      suitability_score: number
    }>
  }
  metadata: {
    style: string
    confidence_score: number
    estimated_generation_time: number
    recommended_model: string
  }
}

/**
 * DiretorVisual Agent Class
 *
 * Analyzes reference images and user photos to create photorealistic prompts
 */
export class DiretorVisual {
  private systemPrompt = `
# 🧠📸 VISUAL DIRECTOR AGENT - PHOTOGRAPHIC SHOOT DIRECTOR

You are a **editorial photography director**, specialist in:
* Contemporary visual aesthetics
* Technical photographic analysis (lens, light, angle, pose)
* Visual prompt engineering for image generation tools
* Adapting fashion, portrait and lifestyle references to real physiognomies

Your job is to **translate visual references into personalized hyper-realistic portraits**, respecting style, composition and atmosphere — but with the user&apos;s face, body and features.

## 🎯 OBJECTIVE:
Analyze reference image and user photos to generate a **descriptive English prompt**, photorealistic and highly technical, containing:
* Visual style * Light * Composition * Camera and lens
* Description of the new subject (the user) * Texture and atmosphere
* Color and emotional climate * Final phrase with: "same style, same lighting, same mood"

## 🔧 BEHAVIOR:
1. **Analyze the reference visually**:
   - Identify light type (soft, hard, directional)
   - Classify camera angle (frontal, lateral, top, etc.)
   - Determine depth of field and focus
   - Evaluate general composition
   - Note the style (fashion, casual, surreal, editorial, etc.)

2. **Analyze user photo(s)**:
   - Identify visual characteristics of face and body
   - Define how they can be adapted to the pose/reference
   - Adjust physical features to fit the same style

3. **Merge reference aesthetics + user content**:
   - Rewrite the scene as if the reference was photographed now with the user as model
   - Adapt body, expression and features coherently to the original aesthetic

## ✅ RULES:
* Always write in English
* Never mention "AI", "generated", "render" or "digital art"
* Always treat as a **real photograph captured by professional camera**
* Keep objective, technical and sensorial tone
* Avoid exaggerations or generic expressions like "stunning" or &ldquo;gorgeous&rdquo;

## 📋 OUTPUT FORMAT:
Ultra-realistic [type] photo, [orientation]
[light description: type, direction, quality]
Captured on [lens info: focal length, aperture], [depth of field]
[Camera angle + composition]
[a man/woman/person with (physical traits), wearing (outfit), posing (gesture/pose), facial expression, hair detail]
[texture: skin, fabric, environmental elements]
Background: [blurred or specific setting, color, texture]
[optional effects: lens flare, vignette, dust particles, etc.]
Color palette: [describe colors]
Atmosphere: [emotional tone, tension or ease]
Same style, same lighting, same mood
  `.trim()

  /**
   * Analyze images and generate photorealistic prompt
   */
  async analyzeAndGeneratePrompt(input: AnalyzeImagesInput): Promise<GeneratedPrompt> {
    // Validate input
    const validatedInput = AnalyzeImagesInputSchema.parse(input)

    try {
      // Simulate image analysis (in real implementation, this would use computer vision)
      const referenceAnalysis = await this.analyzeReferenceImage(validatedInput.referenceImageUrl)
      const userPhotoAnalysis = await this.analyzeUserPhotos(validatedInput.userPhotoUrls)

      // Generate the prompt based on analysis
      const prompt = await this.generatePrompt({
        reference: referenceAnalysis,
        userPhotos: userPhotoAnalysis,
        additionalInstructions: validatedInput.additionalInstructions,
        preferredStyle: validatedInput.style,
        preferredMood: validatedInput.mood
      })

      return {
        prompt: prompt.text,
        analysis: {
          reference: referenceAnalysis,
          userPhotos: userPhotoAnalysis
        },
        metadata: {
          style: referenceAnalysis.style.type,
          confidence_score: prompt.confidence,
          estimated_generation_time: this.estimateGenerationTime(referenceAnalysis),
          recommended_model: this.recommendModel(referenceAnalysis)
        }
      }
    } catch (error) {
      console.error('Error in DiretorVisual analysis:', error)
      throw new Error(`Failed to analyze images: ${error instanceof Error ? error.message : 'Unknown error&apos;}`)
    }
  }

  /**
   * Analyze reference image to extract visual characteristics
   */
  private async analyzeReferenceImage(imageUrl: string): Promise<ImageAnalysis> {
    // In a real implementation, this would use computer vision APIs
    // For now, we'll simulate the analysis based on common patterns

    // This is a simplified simulation - in production, you'd use:
    // - Google Vision API
    // - AWS Rekognition
    // - OpenAI Vision API
    // - Or custom computer vision models

    return {
      lighting: {
        type: 'soft',
        direction: 'front',
        quality: 'natural',
        temperature: 'warm'
      },
      composition: {
        angle: 'eye-level',
        framing: 'medium-shot',
        orientation: 'portrait',
        rule_of_thirds: true
      },
      camera: {
        focal_length: '85mm',
        aperture: 'f/1.8',
        depth_of_field: 'shallow'
      },
      style: {
        type: 'editorial',
        era: 'modern',
        aesthetic: 'minimalist'
      },
      subject: {
        pose: 'relaxed standing',
        expression: 'confident',
        gaze_direction: 'camera',
        clothing_style: 'casual elegant',
        hair_description: 'natural texture'
      },
      environment: {
        background_type: 'indoor',
        background_description: 'softly blurred interior with warm tones',
        props: []
      },
      color_palette: ['warm beige', 'golden skin tones', 'soft white'],
      mood: 'confident and serene'
    }
  }

  /**
   * Analyze user photos to extract characteristics
   */
  private async analyzeUserPhotos(photoUrls: string[]): Promise<Array<{
    url: string
    description: string
    suitability_score: number
  }>> {
    // In a real implementation, this would analyze facial features,
    // body proportions, skin tone, hair color, etc.

    return photoUrls.map((url, index) => ({
      url,
      description: `User photo ${index + 1}: suitable for portrait generation`,
      suitability_score: 0.85 + (Math.random() * 0.15) // Simulated score
    }))
  }

  /**
   * Generate the final prompt based on analysis
   */
  private async generatePrompt(analysis: {
    reference: ImageAnalysis
    userPhotos: Array<{ url: string; description: string; suitability_score: number }>
    additionalInstructions?: string
    preferredStyle?: string
    preferredMood?: string
  }): Promise<{ text: string; confidence: number }> {

    const { reference, additionalInstructions, preferredStyle, preferredMood } = analysis
    const bestUserPhoto = analysis.userPhotos.sort((a, b) => b.suitability_score - a.suitability_score)[0]

    // Build the prompt following the DiretorVisual format
    const promptParts = [
      // Format and type
      `Ultra-realistic ${reference.style.type} photo, ${reference.composition.orientation} format`,

      // Lighting
      `${reference.lighting.quality} ${reference.lighting.type} ${reference.lighting.direction} lighting, ${reference.lighting.temperature} color temperature`,

      // Camera settings
      `Captured on ${reference.camera.focal_length} lens at ${reference.camera.aperture}, ${reference.camera.depth_of_field} depth of field`,

      // Composition
      `${reference.composition.angle} shot, ${reference.composition.framing}`,

      // Subject description (this would be personalized based on user photo analysis)
      `a person with natural features, wearing ${reference.subject.clothing_style} attire, ${reference.subject.pose}, ${reference.subject.expression} expression, ${reference.subject.hair_description}`,

      // Texture details
      `visible skin texture, fabric details, natural shadows and highlights`,

      // Background
      `Background: ${reference.environment.background_description}`,

      // Effects (optional)
      reference.camera.depth_of_field === 'shallow' ? 'natural bokeh, soft background blur' : '&apos;,

      // Color palette
      `Color palette: ${reference.color_palette.join(', ')}`,

      // Atmosphere
      `Atmosphere: ${preferredMood || reference.mood}`,

      // Additional instructions
      additionalInstructions || '',

      // Final signature
      'Same style, same lighting, same mood'
    ]

    const finalPrompt = promptParts
      .filter(part => part.trim().length > 0)
      .join('. ')
      .replace(/\.\s*\./g, '.') // Clean up double periods
      .trim()

    return {
      text: finalPrompt,
      confidence: bestUserPhoto.suitability_score * 0.9 // Confidence based on photo quality
    }
  }

  /**
   * Estimate generation time based on complexity
   */
  private estimateGenerationTime(analysis: ImageAnalysis): number {
    let baseTime = 45 // Base 45 seconds

    // Add time for complexity factors
    if (analysis.camera.depth_of_field === 'shallow') baseTime += 10
    if (analysis.lighting.type === 'mixed') baseTime += 15
    if (analysis.environment.background_type === 'outdoor') baseTime += 10
    if (analysis.style.aesthetic === 'maximalist') baseTime += 20

    return Math.min(baseTime, 90) // Cap at 90 seconds
  }

  /**
   * Recommend AI model based on style and requirements
   */
  private recommendModel(analysis: ImageAnalysis): string {
    // Recommend model based on style and complexity
    if (analysis.style.type === 'fashion' || analysis.style.type === 'editorial') {
      return 'sdxl-lightning' // Fast, high-quality for editorial
    }

    if (analysis.lighting.type === 'mixed' || analysis.environment.background_type === 'outdoor') {
      return 'flux-1.1-pro' // Better for complex lighting
    }

    return 'sdxl' // Default stable diffusion XL
  }

  /**
   * Validate that an image URL is accessible
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok && response.headers.get('content-type')?.startsWith('image/') === true
    } catch {
      return false
    }
  }

  /**
   * Get available style options
   */
  getAvailableStyles(): string[] {
    return ['editorial', 'fashion', 'lifestyle', 'portrait', 'casual', 'vintage', 'surreal']
  }

  /**
   * Get available mood options
   */
  getAvailableMoods(): string[] {
    return ['confident', 'relaxed', 'dramatic', 'playful', 'elegant', 'moody', 'bright']
  }
}