/**
 * Pricing & Engines v1.2 - Single source of truth
 * 
 * Suporta novos motores e custos:
 * - Standard (SDXL) = R$0,025/img
 * - Fast (imagen-4-fast) = R$0,10/img  
 * - Premium (imagen-4) = R$0,1125/img
 * - Edit (nano-banana) = R$0,10/img
 * - Kontext (flux-kontext-pro) = R$0,20/img
 * - Upscale (crisp-upscale) = R$0,0125/op
 */

export type EngineKey = 'standard' | 'fast' | 'premium' | 'edit' | 'kontext' | 'upscale'

export const FX_BRL_PER_USD = Number(process.env.FX_BRL_PER_USD ?? 5)

export const COSTS_USD = {
  standard: 0.005,    // SDXL (Replicate)
  fast: 0.02,         // imagen-4-fast (Replicate)
  premium: 0.0225,    // imagen-4 (KIE)
  edit: 0.02,         // nano-banana (KIE)
  kontext: 0.04,      // flux-kontext-pro (KIE)
  upscale: 0.0025     // recraft crisp-upscale (KIE)
} as const

export const COSTS_BRL: Record<EngineKey, number> = {
  standard: COSTS_USD.standard * FX_BRL_PER_USD,
  fast: COSTS_USD.fast * FX_BRL_PER_USD,
  premium: COSTS_USD.premium * FX_BRL_PER_USD,
  edit: COSTS_USD.edit * FX_BRL_PER_USD,
  kontext: COSTS_USD.kontext * FX_BRL_PER_USD,
  upscale: COSTS_USD.upscale * FX_BRL_PER_USD
}

export const ADDON_PRICES_BRL = {
  fast: 0.40,
  premium: 0.99,
  upscale: 0.19
} as const

export type PlanId = 'free' | 'pro' | 'creator' | 'studio'

export interface Plan {
  id: PlanId
  name: string
  price: number
  stdCredits: number
  premiumIncluded: number
  description: string
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    stdCredits: 15,
    premiumIncluded: 0,
    description: '15 créditos standard por mês',
    features: [
      '15 gerações standard/mês',
      'Qualidade SDXL',
      'Suporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    stdCredits: 120,
    premiumIncluded: 0,
    description: '120 créditos standard + premium sob demanda',
    features: [
      '120 gerações standard/mês',
      'Premium sob demanda (+R$0,99)',
      'Fast sob demanda (+R$0,40)',
      'Upscale (+R$0,19)',
      'Suporte prioritário'
    ]
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 59,
    stdCredits: 300,
    premiumIncluded: 5,
    description: '300 créditos + 5 premium inclusos',
    features: [
      '300 gerações standard/mês',
      '5 gerações premium incluídas',
      'Fast sob demanda (+R$0,40)',
      'Upscale (+R$0,19)',
      'Edição de texto/contexto',
      'Suporte prioritário'
    ]
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 99,
    stdCredits: 600,
    premiumIncluded: 20,
    description: '600 créditos + 20 premium inclusos',
    features: [
      '600 gerações standard/mês',
      '20 gerações premium incluídas',
      'Fast sob demanda (+R$0,40)',
      'Upscale (+R$0,19)',
      'Edição avançada de texto/contexto',
      'Suporte dedicado',
      'API access'
    ]
  }
]

export const FEATURE_FLAGS = {
  pricing_v1_2: (process.env.PRICING_V1_2 ?? 'true') === 'true'
}

export function brl(n: number): number {
  return Math.round(n * 100) / 100
}

export function getPlan(planId: PlanId): Plan {
  const plan = PLANS.find(p => p.id === planId)
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`)
  }
  return plan
}

export function getFreePlan(): Plan {
  return getPlan('free')
}

export function getPlans(): Plan[] {
  return PLANS
}

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

export function getEngineDisplayName(engine: EngineKey): string {
  const names = {
    standard: 'Standard (SDXL)',
    fast: 'Fast (Imagen-4)',
    premium: 'Premium (Imagen-4)',
    edit: 'Edição (Nano-Banana)',
    kontext: 'Kontext (Flux Pro)',
    upscale: 'Upscale (Crisp)'
  }
  return names[engine]
}

export function getEngineDescription(engine: EngineKey): string {
  const descriptions = {
    standard: 'Qualidade padrão, ideal para a maioria dos casos',
    fast: 'Geração rápida com qualidade superior',
    premium: 'Máxima qualidade fotorrealística',
    edit: 'Edição de imagens existentes',
    kontext: 'Especializado em texto e contexto complexo',
    upscale: 'Aumento de resolução com qualidade crisp'
  }
  return descriptions[engine]
}

// Legacy exports for backward compatibility
export function getPremiumPrice(): number {
  return ADDON_PRICES_BRL.premium
}

export function canUserGenerate(): boolean {
  // Legacy function - use server/billing.ts instead
  return true
}