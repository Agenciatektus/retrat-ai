"use client"

import { useState, useEffect, Suspense } from 'react'
import { useBilling } from '@/hooks/useBilling'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { CreditCard, Calendar, Zap, AlertCircle, CheckCircle, Settings, Crown, TrendingUp } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

// Component that uses useSearchParams - needs to be in Suspense
function BillingContent() {
  const { user, loading: authLoading } = useAuth()
  const {
    billingInfo,
    loading,
    error,
    refetchBilling,
    createPortalSession,
    quotaRemaining,
    canGenerate
  } = useBilling()
  const [portalLoading, setPortalLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      setShowSuccess(true)
      refetchBilling() // Refresh billing info after successful payment
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/billing')
    }

    if (canceled === 'true') {
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/billing')
    }
  }, [searchParams, refetchBilling])

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true)
      const portalUrl = await createPortalSession()
      window.location.href = portalUrl
    } catch (error) {
      console.error('Failed to create portal session:', error)
      setPortalLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Carregando informações...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const currentPlan = billingInfo?.subscription?.plan || { id: 'free', name: 'Gratuito', price_monthly: 0 }
  const subscription = billingInfo?.subscription
  const currentUsage = billingInfo?.currentUsage
  const usedGenerations = currentUsage?.generations_used || 0
  const totalQuota = currentPlan.quota_generations

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-surface-glass to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">
                Billing & Subscription
              </h1>
              <p className="text-foreground-muted mt-2">
                Gerencie seu plano e acompanhe o uso
              </p>
            </div>

            <div className="flex items-center gap-3">
              {subscription && (
                <Button
                  variant="outline"
                  leftIcon={<Settings className="w-4 h-4" />}
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? 'Carregando...' : 'Gerenciar'}
                </Button>
              )}

              <Button
                variant="primary"
                leftIcon={<Crown className="w-4 h-4" />}
                onClick={handleUpgrade}
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <Card variant="glass" padding="md" className="mb-8 border-success/20 bg-success/5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <h3 className="font-semibold text-success">Pagamento realizado com sucesso!</h3>
                <p className="text-success/80 text-sm">
                  Sua assinatura foi ativada e você já pode utilizar todos os recursos.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card variant="glass" padding="md" className="mb-8 border-error/20 bg-error/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error" />
              <div>
                <h3 className="font-semibold text-error">Erro ao carregar informações</h3>
                <p className="text-error/80 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent-gold" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        {currentPlan.name}
                        {currentPlan.id === 'pro' && <Crown className="w-5 h-5 text-accent-gold" />}
                      </h3>
                      <p className="text-foreground-muted">
                        {currentPlan.id === 'free'
                          ? 'Plano gratuito com recursos básicos'
                          : 'Plano premium com recursos avançados'
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-2xl font-bold text-foreground">
                          {currentPlan.id === 'free' ? 'R$ 0' : `R$ ${(currentPlan.price_monthly / 100).toFixed(0)}`}
                        </span>
                        {currentPlan.id !== 'free' && (
                          <span className="text-foreground-muted">/mês</span>
                        )}
                      </div>

                      {subscription?.status && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subscription.status === 'active'
                            ? 'bg-success/10 text-success'
                            : subscription.status === 'canceled'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-error/10 text-error'
                        }`}>
                          {subscription.status === 'active' && 'Ativo'}
                          {subscription.status === 'canceled' && 'Cancelado'}
                          {subscription.status === 'past_due' && 'Em Atraso'}
                        </div>
                      )}
                    </div>

                    {subscription?.current_period_end && (
                      <div className="flex items-center gap-2 text-sm text-foreground-muted">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {subscription.status === 'canceled' ? 'Válido' : 'Renovação'} até{' '}
                          {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {currentPlan.id === 'free' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Crown className="w-4 h-4" />}
                      onClick={handleUpgrade}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent-gold" />
                  Uso do Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Generation Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-foreground">Gerações esta semana</span>
                      <span className="text-foreground font-medium">
                        {usedGenerations}{totalQuota ? ` / ${totalQuota}` : ' (ilimitado)'}
                      </span>
                    </div>

                    {totalQuota && (
                      <div className="w-full bg-surface-glass rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usedGenerations >= totalQuota
                              ? 'bg-error'
                              : usedGenerations >= totalQuota * 0.8
                                ? 'bg-warning'
                                : 'bg-accent-gold'
                          }`}
                          style={{
                            width: `${Math.min((usedGenerations / totalQuota) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    )}

                    <div className="mt-2 text-sm text-foreground-muted">
                      {quotaRemaining === null
                        ? 'Gerações ilimitadas'
                        : quotaRemaining > 0
                          ? `${quotaRemaining} gerações restantes`
                          : 'Cota esgotada esta semana'
                      }
                    </div>
                  </div>

                  {/* Quota Status */}
                  <div className={`p-4 rounded-lg border ${
                    canGenerate
                      ? 'border-success/20 bg-success/5'
                      : 'border-warning/20 bg-warning/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      {canGenerate ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-warning" />
                      )}
                      <div>
                        <h4 className={`font-medium ${canGenerate ? 'text-success' : 'text-warning'}`}>
                          {canGenerate ? 'Pronto para gerar' : 'Cota esgotada'}
                        </h4>
                        <p className={`text-sm ${canGenerate ? 'text-success/80' : 'text-warning/80'}`}>
                          {canGenerate
                            ? 'Você pode criar novos retratos agora'
                            : 'Faça upgrade para continuar gerando'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    leftIcon={<Zap className="w-4 h-4" />}
                    onClick={() => router.push('/projects')}
                    disabled={!canGenerate}
                  >
                    {canGenerate ? 'Criar Projeto' : 'Cota Esgotada'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<Crown className="w-4 h-4" />}
                    onClick={handleUpgrade}
                  >
                    Ver Todos os Planos
                  </Button>

                  {subscription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      leftIcon={<Settings className="w-4 h-4" />}
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                    >
                      Gerenciar Assinatura
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan Features */}
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Recursos do Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span>
                      {totalQuota ? `${totalQuota} gerações/semana` : 'Gerações ilimitadas'}
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span>Resolução até {currentPlan.max_resolution}x{currentPlan.max_resolution}</span>
                  </li>

                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span>{currentPlan.watermark ? 'Com marca d\'água' : 'Sem marca d\'água'}</span>
                  </li>

                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span>Galeria de projetos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading component for Suspense
function BillingPageLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-foreground-muted">Carregando página de billing...</p>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function BillingPage() {
  return (
    <Suspense fallback={<BillingPageLoading />}>
      <BillingContent />
    </Suspense>
  )
}