"use client"

import { useState, useEffect } from 'react'
import { useBilling } from '@/hooks/useBilling'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Check, Sparkles, Crown, Zap, Star, Plus, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlanData {
  id: string
  name: string
  price_brl: number
  std_credits: number
  premium_included: number
  features: string[]
  premium_policy?: string
}

interface CopyCard {
  title: string
  price: string
  bullets: string[]
  cta: string
}

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth()
  const { billingInfo, loading: billingLoading, createCheckoutSession } = useBilling()
  const [plansData, setPlansData] = useState<{plans: PlanData[], copy_cards: Record<string, CopyCard>} | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const router = useRouter()

  // Fetch plans from new API
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/plans')
        if (response.ok) {
          const data = await response.json()
          setPlansData(data)
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      }
    }
    fetchPlans()
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      setCheckoutLoading(planId)
      const sessionUrl = await createCheckoutSession(planId)
      window.location.href = sessionUrl
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      setCheckoutLoading(null)
    }
  }

  if (authLoading || billingLoading || !plansData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Carregando planos...</p>
        </div>
      </div>
    )
  }

  const currentPlan = billingInfo?.subscription?.plan || plansData.plans.find(p => p.id === 'free')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-surface-glass to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span className="text-accent-gold text-sm font-medium">Pricing v1.1</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
              Planos para todos os <span className="text-accent-gold">criadores</span>
            </h1>

            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Mais flexibilidade, mais recursos, melhor preço. Escolha o plano ideal para suas necessidades.
            </p>

            {billingInfo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
                <span className="text-success text-sm">
                  Plano atual: <strong>{currentPlan?.name}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plansData.plans.map((plan, index) => {
            const copyCard = plansData.copy_cards[plan.id]
            const isCurrentPlan = currentPlan?.id === plan.id
            const isPopular = plan.id === 'creator' // Creator plan is most popular
            const isPremium = plan.id === 'studio'

            return (
              <Card
                key={plan.id}
                variant={isPremium ? 'elevated' : isPopular ? 'glass' : 'outline'}
                padding="lg"
                className={`relative ${
                  isPremium ? 'border-accent-gold/30 shadow-xl shadow-accent-gold/10' :
                  isPopular ? 'border-blue-500/30' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold">
                      <Star className="w-4 h-4" />
                      Mais Popular
                    </div>
                  </div>
                )}

                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-background rounded-full text-sm font-semibold">
                      <Crown className="w-4 h-4" />
                      Premium
                    </div>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      isPremium
                        ? 'bg-gradient-to-br from-accent-gold to-amber-500'
                        : isPopular
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : plan.id === 'pro'
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : 'bg-surface-glass'
                    }`}>
                      {plan.id === 'free' && <Star className="w-8 h-8 text-foreground-muted" />}
                      {plan.id === 'pro' && <Zap className="w-8 h-8 text-white" />}
                      {plan.id === 'creator' && <Sparkles className="w-8 h-8 text-white" />}
                      {plan.id === 'studio' && <Crown className="w-8 h-8 text-background" />}
                    </div>

                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        {copyCard?.title || plan.name}
                      </CardTitle>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-foreground">
                          {copyCard?.price || (plan.id === 'free' ? 'Grátis' : `R$ ${plan.price_brl}`)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {plan.std_credits} créditos standard/mês
                        {plan.premium_included > 0 && (
                          <div className="text-accent-gold">
                            + {plan.premium_included} premium inclusos
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {/* Features */}
                    <ul className="space-y-3">
                      {(copyCard?.bullets || plan.features).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      variant={isCurrentPlan ? 'outline' : (isPremium ? 'primary' : isPopular ? 'primary' : 'outline')}
                      size="lg"
                      className="w-full"
                      disabled={isCurrentPlan || checkoutLoading === plan.id}
                      onClick={() => !isCurrentPlan && plan.id !== 'free' && handleUpgrade(plan.id)}
                      leftIcon={
                        checkoutLoading === plan.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isPremium ? (
                          <Crown className="w-4 h-4" />
                        ) : isPopular ? (
                          <Sparkles className="w-4 h-4" />
                        ) : plan.id === 'pro' ? (
                          <Zap className="w-4 h-4" />
                        ) : undefined
                      }
                    >
                      {isCurrentPlan
                        ? 'Plano Atual'
                        : plan.id === 'free'
                          ? (user ? 'Plano Gratuito' : copyCard?.cta || 'Começar Grátis')
                          : checkoutLoading === plan.id
                            ? 'Processando...'
                            : copyCard?.cta || 'Assinar'
                      }
                    </Button>

                    {plan.id === 'free' && !user && (
                      <p className="text-xs text-foreground-muted text-center">
                        Cadastre-se para começar a usar
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add-ons Info */}
        <div className="mt-16 text-center">
          <Card variant="glass" padding="lg" className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 text-accent-gold" />
                Add-ons Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-accent-gold" />
                  </div>
                  <h4 className="font-semibold text-foreground">Premium Extra</h4>
                  <p className="text-sm text-foreground-muted">R$ 0,99 por foto premium adicional</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6 text-accent-gold" />
                  </div>
                  <h4 className="font-semibold text-foreground">Pacote +100</h4>
                  <p className="text-sm text-foreground-muted">R$ 6,00 por 100 créditos standard extras</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-foreground-muted text-sm">
            • Créditos renovam mensalmente (não cumulativos) • Premium extra: R$ 0,99/foto • +100 standard: R$ 6,00
          </p>
          <p className="text-foreground-muted text-xs">
            Use apenas fotos e referências que você pode utilizar.
          </p>
        </div>

        {/* FAQ or Contact */}
        <div className="mt-16 text-center">
          <p className="text-foreground-muted">
            Tem dúvidas? <a href="mailto:contato@retrat.ai" className="text-accent-gold hover:underline">Entre em contato</a>
          </p>
        </div>
      </div>
    </div>
  )
}