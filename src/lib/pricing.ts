/**
 * Pricing System v1.1 - Single Source of Truth
 * Based on PLANS-v1.1.yaml and system-update-plans.md
 */

export interface Plan {
  id: string
  name: string
  price_brl: number
  std_credits: number
  premium_included: number
  features: string[]
  premium_policy?: 'pay_per_use'
}

export interface PlanCopy {
  title: string
  price: string
  bullets: string[]
  cta: string
}

export interface AddOns {
  premium_extra_price: number
  std_extra_100_price: number
}

export interface PricingConfig {
  version: string
  currency: string
  addons: AddOns
  plans: Plan[]
  copy_cards: Record<string, PlanCopy>
}

// Single source of truth for pricing - based on PLANS-v1.1.yaml
export const PRICING_CONFIG: PricingConfig = {
  version: "1.1",
  currency: "BRL",
  addons: {
    premium_extra_price: 0.99,
    std_extra_100_price: 6.00
  },
  plans: [
    {
      id: "free",
      name: "Free",
      price_brl: 0,
      std_credits: 15,
      premium_included: 0,
      features: ["Standard only", "Resolução padrão com marca d'água"]
    },
    {
      id: "pro", 
      name: "Pro",
      price_brl: 29,
      std_credits: 120,
      premium_included: 0,
      features: ["HD sem marca d'água", "Fundo transparente", "Variações avançadas"],
      premium_policy: "pay_per_use"
    },
    {
      id: "creator",
      name: "Creator", 
      price_brl: 59,
      std_credits: 300,
      premium_included: 5,
      features: ["HD", "Fundo transparente", "Exportações em lote", "Suporte prioritário"]
    },
    {
      id: "studio",
      name: "Studio",
      price_brl: 99, 
      std_credits: 600,
      premium_included: 20,
      features: ["HD+", "Presets por projeto", "Variações em série", "Processamento prioritário", "Suporte dedicado"]
    }
  ],
  copy_cards: {
    free: {
      title: "Free",
      price: "R$ 0/mês",
      bullets: [
        "15 fotos/mês (standard)",
        "Resolução padrão • marca d'água", 
        "Galeria por projeto e variações básicas",
        "Exportação para feed e stories"
      ],
      cta: "Começar grátis"
    },
    pro: {
      title: "Pro",
      price: "R$ 29/mês", 
      bullets: [
        "120 fotos/mês (standard)",
        "HD • sem marca d'água",
        "Fundo transparente + variações avançadas",
        "Premium sob demanda: R$ 0,99/foto",
        "Suporte por e-mail"
      ],
      cta: "Assinar Pro"
    },
    creator: {
      title: "Creator",
      price: "R$ 59/mês",
      bullets: [
        "300 fotos/mês (standard)", 
        "5 fotos Premium inclusas/mês",
        "HD, fundo transparente, controle fino de estilo",
        "Exportações em lote",
        "Suporte prioritário"
      ],
      cta: "Assinar Creator"
    },
    studio: {
      title: "Studio", 
      price: "R$ 99/mês",
      bullets: [
        "600 fotos/mês (standard)",
        "20 fotos Premium inclusas/mês", 
        "HD+, presets salvos por projeto, variações em série",
        "Processamento prioritário",
        "Suporte dedicado"
      ],
      cta: "Assinar Studio"
    }
  }
}

export function getPlan(planId: string): Plan | null {
  return PRICING_CONFIG.plans.find(plan => plan.id === planId) || null
}

export function getPlanCopy(planId: string): PlanCopy | null {
  return PRICING_CONFIG.copy_cards[planId] || null
}

export function calculateCreditsUsed(
  standardGenerations: number,
  premiumGenerations: number
): { standard: number; premium: number } {
  return {
    standard: standardGenerations,
    premium: premiumGenerations
  }
}

export function canUserGenerate(
  plan: Plan,
  currentUsage: { std_used: number; premium_used: number },
  generationType: 'standard' | 'premium' = 'standard'
): { canGenerate: boolean; reason?: string } {
  if (generationType === 'standard') {
    if (currentUsage.std_used >= plan.std_credits) {
      return {
        canGenerate: false,
        reason: 'Standard credits exhausted'
      }
    }
    return { canGenerate: true }
  }

  if (generationType === 'premium') {
    if (currentUsage.premium_used >= plan.premium_included) {
      return {
        canGenerate: plan.premium_policy === 'pay_per_use',
        reason: plan.premium_policy === 'pay_per_use' 
          ? 'Premium add-on required'
          : 'Premium credits exhausted'
      }
    }
    return { canGenerate: true }
  }

  return { canGenerate: false, reason: 'Unknown generation type' }
}

export const TELEMETRY_EVENTS = [
  'plan_viewed',
  'plan_selected', 
  'checkout_completed',
  'generation_requested',
  'generation_succeeded',
  'quota_exceeded',
  'addon_purchased',
  'extra_pack_purchased'
] as const

export type TelemetryEvent = typeof TELEMETRY_EVENTS[number]

// Function to get current pricing configuration (used by API)
export function getCurrentPricingConfig(): PricingConfig {
  return PRICING_CONFIG
}

// Function to get premium add-on price
export function getPremiumPrice(): number {
  return PRICING_CONFIG.addons.premium_extra_price
}

// Function to get standard extra pack price
export function getStandardExtraPrice(): number {
  return PRICING_CONFIG.addons.std_extra_100_price
}
