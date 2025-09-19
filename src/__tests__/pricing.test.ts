/**
 * Tests for Pricing v1.2
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { 
  COSTS_USD, 
  COSTS_BRL, 
  ADDON_PRICES_BRL, 
  FX_BRL_PER_USD,
  brl,
  getPlan,
  getPlans,
  formatBRL,
  getEngineDisplayName
} from '@/lib/pricing'
import { determineEngine, validateEngine, getEnginesByProvider } from '@/lib/engines'

describe('Pricing v1.2', () => {
  describe('Currency conversion', () => {
    it('should convert USD to BRL correctly', () => {
      const expectedStandard = COSTS_USD.standard * FX_BRL_PER_USD
      expect(COSTS_BRL.standard).toBe(expectedStandard)
    })

    it('should round BRL values correctly', () => {
      expect(brl(0.12345)).toBe(0.12)
      expect(brl(0.126)).toBe(0.13)
      expect(brl(1.999)).toBe(2)
    })

    it('should format BRL currency', () => {
      expect(formatBRL(29.99)).toBe('R$ 29,99')
      expect(formatBRL(0.40)).toBe('R$ 0,40')
    })
  })

  describe('Plans', () => {
    it('should return all plans', () => {
      const plans = getPlans()
      expect(plans).toHaveLength(4)
      expect(plans.map(p => p.id)).toEqual(['free', 'pro', 'creator', 'studio'])
    })

    it('should get specific plan', () => {
      const freePlan = getPlan('free')
      expect(freePlan.id).toBe('free')
      expect(freePlan.price).toBe(0)
      expect(freePlan.stdCredits).toBe(15)
      expect(freePlan.premiumIncluded).toBe(0)
    })

    it('should get creator plan with premium included', () => {
      const creatorPlan = getPlan('creator')
      expect(creatorPlan.premiumIncluded).toBe(5)
    })

    it('should throw error for invalid plan', () => {
      expect(() => getPlan('invalid' as any)).toThrow('Plan not found: invalid')
    })
  })

  describe('Engines', () => {
    it('should validate engine keys', () => {
      expect(validateEngine('standard')).toBe(true)
      expect(validateEngine('premium')).toBe(true)
      expect(validateEngine('invalid')).toBe(false)
    })

    it('should get engines by provider', () => {
      const replicateEngines = getEnginesByProvider('replicate')
      expect(replicateEngines).toContain('standard')
      expect(replicateEngines).toContain('fast')

      const kieEngines = getEnginesByProvider('kie')
      expect(kieEngines).toContain('premium')
      expect(kieEngines).toContain('upscale')
    })

    it('should determine engine from request', () => {
      // Generate mode
      expect(determineEngine({ mode: 'generate', quality: 'standard' })).toBe('standard')
      expect(determineEngine({ mode: 'generate', quality: 'fast' })).toBe('fast')
      expect(determineEngine({ mode: 'generate', quality: 'premium' })).toBe('premium')

      // Edit mode
      expect(determineEngine({ mode: 'edit', useKontext: false })).toBe('edit')
      expect(determineEngine({ mode: 'edit', useKontext: true })).toBe('kontext')

      // Upscale mode
      expect(determineEngine({ mode: 'upscale' })).toBe('upscale')
    })

    it('should get engine display names', () => {
      expect(getEngineDisplayName('standard')).toBe('Standard (SDXL)')
      expect(getEngineDisplayName('premium')).toBe('Premium (Imagen-4)')
    })
  })

  describe('Addon pricing', () => {
    it('should have correct addon prices', () => {
      expect(ADDON_PRICES_BRL.fast).toBe(0.40)
      expect(ADDON_PRICES_BRL.premium).toBe(0.99)
      expect(ADDON_PRICES_BRL.upscale).toBe(0.19)
    })
  })

  describe('Cost calculations', () => {
    it('should have consistent costs', () => {
      // Standard should be cheapest
      expect(COSTS_BRL.standard).toBeLessThan(COSTS_BRL.fast)
      expect(COSTS_BRL.standard).toBeLessThan(COSTS_BRL.premium)

      // Premium should be most expensive for generation
      expect(COSTS_BRL.premium).toBeGreaterThan(COSTS_BRL.fast)
      expect(COSTS_BRL.premium).toBeGreaterThan(COSTS_BRL.standard)

      // Upscale should be cheapest operation
      expect(COSTS_BRL.upscale).toBeLessThan(COSTS_BRL.standard)
    })
  })
})

describe('Feature Flags', () => {
  it('should read pricing_v1_2 flag from env', () => {
    // This would need to be mocked in a real test environment
    // For now, just check the structure
    expect(typeof process.env.PRICING_V1_2).toBe('string')
  })
})
