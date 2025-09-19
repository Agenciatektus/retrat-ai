/**
 * Engine Router - Routes to correct provider based on engine
 * 
 * Providers:
 * - Replicate: SDXL, imagen-4-fast
 * - KIE: imagen-4, nano-banana, flux-kontext-pro, crisp-upscale
 */

import { type EngineKey } from './pricing'

export type Provider = 'replicate' | 'kie'

export interface EngineTarget {
  provider: Provider
  model: string
  endpoint?: string
}

export const ENGINES: Record<EngineKey, EngineTarget> = {
  standard: { 
    provider: 'replicate', 
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
  },
  fast: { 
    provider: 'replicate', 
    model: 'google/imagen-3-fast:0d0161e5a4a6c6c6f8c2d3f7c4b5e8f9a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
  },
  premium: { 
    provider: 'kie', 
    model: 'google/imagen-4',
    endpoint: 'https://api.kie.ai/v1/generate'
  },
  edit: { 
    provider: 'kie', 
    model: 'google/nano-banana',
    endpoint: 'https://api.kie.ai/v1/edit'
  },
  kontext: { 
    provider: 'kie', 
    model: 'black-forest-labs/flux-kontext-pro',
    endpoint: 'https://api.kie.ai/v1/generate'
  },
  upscale: { 
    provider: 'kie', 
    model: 'recraft/crisp-upscale',
    endpoint: 'https://api.kie.ai/v1/upscale'
  }
}

export function getEngineTarget(engine: EngineKey): EngineTarget {
  return ENGINES[engine]
}

export function isReplicateEngine(engine: EngineKey): boolean {
  return ENGINES[engine].provider === 'replicate'
}

export function isKIEEngine(engine: EngineKey): boolean {
  return ENGINES[engine].provider === 'kie'
}

export function getEnginesByProvider(provider: Provider): EngineKey[] {
  return Object.entries(ENGINES)
    .filter(([, target]) => target.provider === provider)
    .map(([engine]) => engine as EngineKey)
}

export function validateEngine(engine: string): engine is EngineKey {
  return engine in ENGINES
}

export type GenerationMode = 'generate' | 'edit' | 'upscale'
export type QualityLevel = 'standard' | 'fast' | 'premium'

export interface GenerationRequest {
  mode: GenerationMode
  quality?: QualityLevel
  useKontext?: boolean
  prompt?: string
  imageUrl?: string
  upscaleFactor?: number
}

export function determineEngine(request: GenerationRequest): EngineKey {
  const { mode, quality = 'standard', useKontext = false } = request

  if (mode === 'upscale') {
    return 'upscale'
  }

  if (mode === 'edit') {
    return useKontext ? 'kontext' : 'edit'
  }

  // mode === 'generate'
  switch (quality) {
    case 'premium':
      return 'premium'
    case 'fast':
      return 'fast'
    case 'standard':
    default:
      return 'standard'
  }
}

export function getEngineConfig(engine: EngineKey) {
  const target = ENGINES[engine]
  
  const baseConfig = {
    engine,
    provider: target.provider,
    model: target.model,
    endpoint: target.endpoint
  }

  // Provider-specific configurations
  if (target.provider === 'replicate') {
    return {
      ...baseConfig,
      version: 'latest',
      webhook: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/replicate'
    }
  }

  if (target.provider === 'kie') {
    return {
      ...baseConfig,
      apiKey: process.env.KIE_API_KEY,
      webhook: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/kie'
    }
  }

  return baseConfig
}
