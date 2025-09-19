import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { COSTS_BRL, ADDON_PRICES_BRL, FEATURE_FLAGS } from '@/lib/pricing'
import { determineEngine, getEngineConfig, type GenerationRequest } from '@/lib/engines'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const GenerateRequestSchema = z.object({
  mode: z.enum(['generate', 'edit', 'upscale']).default('generate'),
  quality: z.enum(['standard', 'fast', 'premium']).default('standard'),
  useKontext: z.boolean().default(false),
  prompt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  upscaleFactor: z.number().min(1).max(4).default(2),
  projectId: z.string().uuid(),
  referenceId: z.string().uuid().optional()
})

// POST /api/generate/v2 - New generation API with engine routing
export async function POST(request: NextRequest) {
  try {
    // Check if v1.2 is enabled
    if (!FEATURE_FLAGS.pricing_v1_2) {
      return NextResponse.json(
        { error: 'Pricing v1.2 not enabled' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const body = await request.json()
    const requestData = GenerateRequestSchema.parse(body)

    // Determine which engine to use
    const engine = determineEngine(requestData)
    const engineConfig = getEngineConfig(engine)

    // Check user quota and billing
    const billingResult = await handleBilling(user.id, engine, supabase)
    if (!billingResult.success) {
      return NextResponse.json(
        { error: billingResult.error, code: billingResult.code },
        { status: billingResult.status }
      )
    }

    // Create generation record
    const { data: generation, error: generationError } = await supabase
      .from('generations_v2')
      .insert({
        project_id: requestData.projectId,
        user_id: user.id,
        engine,
        provider: engineConfig.provider,
        model: engineConfig.model,
        status: 'pending',
        prompt: requestData.prompt,
        input_image_url: requestData.imageUrl,
        cost_usd: COSTS_BRL[engine] / 5, // Convert BRL to USD
        cost_brl: COSTS_BRL[engine],
        metadata: {
          mode: requestData.mode,
          quality: requestData.quality,
          useKontext: requestData.useKontext,
          upscaleFactor: requestData.upscaleFactor,
          billing: billingResult.billing
        }
      })
      .select()
      .single()

    if (generationError) {
      console.error('Error creating generation record:', generationError)
      return NextResponse.json({ error: 'Failed to create generation' }, { status: 500 })
    }

    // Start generation with appropriate provider
    let providerResult
    try {
      if (engineConfig.provider === 'replicate') {
        providerResult = await startReplicateGeneration(engineConfig, requestData, generation.id)
      } else if (engineConfig.provider === 'kie') {
        providerResult = await startKIEGeneration(engineConfig, requestData, generation.id)
      } else {
        throw new Error(`Unknown provider: ${engineConfig.provider}`)
      }

      // Update generation with provider ID
      await supabase
        .from('generations_v2')
        .update({
          status: 'processing',
          provider_id: providerResult.id,
          metadata: {
            ...generation.metadata,
            provider_response: providerResult
          }
        })
        .eq('id', generation.id)

      // Track telemetry
      await trackGeneration(user.id, engine, COSTS_BRL[engine], billingResult.billing)

      return NextResponse.json({
        generation: {
          id: generation.id,
          engine,
          provider: engineConfig.provider,
          status: 'processing',
          cost_brl: COSTS_BRL[engine],
          estimated_time: getEstimatedTime(engine),
          provider_id: providerResult.id
        },
        success: true
      }, { status: 201 })

    } catch (providerError) {
      console.error('Provider error:', providerError)
      
      // Update generation status to failed
      await supabase
        .from('generations_v2')
        .update({
          status: 'failed',
          error_message: providerError instanceof Error ? providerError.message : 'Unknown error'
        })
        .eq('id', generation.id)

      return NextResponse.json({ 
        error: 'Failed to start generation',
        details: providerError instanceof Error ? providerError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Unexpected error in POST /api/generate/v2:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleBilling(userId: string, engine: string, supabase: any) {
  try {
    if (engine === 'standard') {
      // Try to debit standard credits
      const { data: success } = await supabase.rpc('debit_standard_credits', {
        user_uuid: userId,
        amount: 1
      })

      if (!success) {
        return {
          success: false,
          error: 'Insufficient standard credits. Upgrade your plan or wait for next month.',
          code: 'QUOTA_EXCEEDED',
          status: 429
        }
      }

      return {
        success: true,
        billing: { type: 'standard_credit', amount: 1 }
      }
    }

    if (engine === 'premium' || engine === 'edit' || engine === 'kontext') {
      // Try to use premium included credits first
      const { data: usedIncluded } = await supabase.rpc('debit_premium_credits', {
        user_uuid: userId,
        amount: 1
      })

      if (usedIncluded) {
        return {
          success: true,
          billing: { type: 'premium_included', amount: 1 }
        }
      }

      // Need to charge addon
      const addonPrice = ADDON_PRICES_BRL.premium
      // TODO: Integrate with Stripe for one-off payment
      // For now, return error asking for payment
      return {
        success: false,
        error: `Premium generation requires payment of ${addonPrice.toFixed(2)} BRL. No premium credits available.`,
        code: 'PAYMENT_REQUIRED',
        status: 402
      }
    }

    if (engine === 'fast') {
      // Always requires addon payment
      const addonPrice = ADDON_PRICES_BRL.fast
      // TODO: Integrate with Stripe for one-off payment
      return {
        success: false,
        error: `Fast generation requires payment of ${addonPrice.toFixed(2)} BRL.`,
        code: 'PAYMENT_REQUIRED',
        status: 402
      }
    }

    if (engine === 'upscale') {
      // Always requires addon payment
      const addonPrice = ADDON_PRICES_BRL.upscale
      // TODO: Integrate with Stripe for one-off payment
      return {
        success: false,
        error: `Upscale requires payment of ${addonPrice.toFixed(2)} BRL.`,
        code: 'PAYMENT_REQUIRED',
        status: 402
      }
    }

    return {
      success: false,
      error: 'Unknown engine type',
      code: 'INVALID_ENGINE',
      status: 400
    }

  } catch (error) {
    console.error('Billing error:', error)
    return {
      success: false,
      error: 'Billing system error',
      code: 'BILLING_ERROR',
      status: 500
    }
  }
}

async function startReplicateGeneration(config: any, request: any, generationId: string) {
  // TODO: Implement Replicate API call
  return {
    id: `replicate_${Date.now()}`,
    status: 'starting',
    urls: {
      get: `https://api.replicate.com/v1/predictions/replicate_${Date.now()}`,
      cancel: `https://api.replicate.com/v1/predictions/replicate_${Date.now()}/cancel`
    }
  }
}

async function startKIEGeneration(config: any, request: any, generationId: string) {
  // TODO: Implement KIE API call
  return {
    id: `kie_${Date.now()}`,
    status: 'queued',
    webhook: config.webhook
  }
}

async function trackGeneration(userId: string, engine: string, costBrl: number, billing: any) {
  // TODO: Implement PostHog tracking
  console.log('Track generation:', {
    event: 'engine_selected',
    userId,
    properties: {
      engine,
      cost_brl: costBrl,
      billing_type: billing.type
    }
  })
}

function getEstimatedTime(engine: string): number {
  const times = {
    standard: 30, // 30 seconds
    fast: 10,     // 10 seconds
    premium: 60,  // 60 seconds
    edit: 45,     // 45 seconds
    kontext: 90,  // 90 seconds
    upscale: 20   // 20 seconds
  }
  return times[engine as keyof typeof times] || 30
}
