"use client"

import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  DollarSign,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AnalyticsData {
  // User metrics
  newUsersToday: number
  newUsersWeek: number
  activeUsersToday: number
  
  // Generation metrics
  generationsToday: number
  generationsWeek: number
  successRate: number
  avgGenerationTime: number
  
  // Revenue metrics
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  conversionRate: number
  
  // Popular features
  topProjects: Array<{ name: string; generations: number }>
  topUsers: Array<{ email: string; generations: number }>
}

export default function AdminAnalyticsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week')

  // Check admin access
  const isAdmin = profile?.email === 'peterson@agenciatektus.com.br' || profile?.plan === 'admin'

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      loadAnalytics()
    }
  }, [user, profile, loading, isAdmin, router, timeRange])

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-surface-glass to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Voltar
                </Button>
                <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-accent-gold" />
                  Analytics & Monitoring
                </h1>
              </div>
              <p className="text-foreground-muted">
                Métricas detalhadas de uso e performance
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent-gold"
              >
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={loadAnalytics}
                disabled={analyticsLoading}
                leftIcon={<RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">Novos Usuários</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsLoading ? '...' : analytics?.newUsersWeek || 0}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {timeRange === 'today' ? 'hoje' : timeRange === 'week' ? 'esta semana' : 'este mês'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-accent-gold" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">Gerações</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsLoading ? '...' : analytics?.generationsWeek || 0}
                  </p>
                  <p className="text-xs text-success">
                    {analyticsLoading ? '...' : `${(analytics?.successRate || 0).toFixed(1)}% sucesso`}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-accent-gold" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">Receita</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {analyticsLoading ? '...' : (analytics?.revenueWeek || 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-success">
                    {analyticsLoading ? '...' : `${(analytics?.conversionRate || 0).toFixed(1)}% conversão`}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-accent-gold" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">Tempo Médio</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsLoading ? '...' : `${analytics?.avgGenerationTime || 0}s`}
                  </p>
                  <p className="text-xs text-foreground-muted">por geração</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* External Analytics Links */}
        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-accent-gold" />
              Dashboards Externos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="https://app.posthog.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent-gold/50 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-accent-gold" />
                <div>
                  <p className="font-medium text-foreground">PostHog</p>
                  <p className="text-sm text-foreground-muted">Eventos e funis</p>
                </div>
                <ExternalLink className="w-4 h-4 text-foreground-muted ml-auto" />
              </a>

              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent-gold/50 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-accent-gold" />
                <div>
                  <p className="font-medium text-foreground">Sentry</p>
                  <p className="text-sm text-foreground-muted">Erros e performance</p>
                </div>
                <ExternalLink className="w-4 h-4 text-foreground-muted ml-auto" />
              </a>

              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent-gold/50 transition-colors"
              >
                <DollarSign className="w-5 h-5 text-accent-gold" />
                <div>
                  <p className="font-medium text-foreground">Stripe</p>
                  <p className="text-sm text-foreground-muted">Pagamentos</p>
                </div>
                <ExternalLink className="w-4 h-4 text-foreground-muted ml-auto" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Projects */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Projetos Mais Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-surface-glass animate-pulse rounded"></div>
                  ))}
                </div>
              ) : analytics?.topProjects?.length ? (
                <div className="space-y-3">
                  {analytics.topProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{project.name}</p>
                        <p className="text-sm text-foreground-muted">{project.generations} gerações</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-accent-gold">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground-muted text-center py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Usuários Mais Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-surface-glass animate-pulse rounded"></div>
                  ))}
                </div>
              ) : analytics?.topUsers?.length ? (
                <div className="space-y-3">
                  {analytics.topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{user.email}</p>
                        <p className="text-sm text-foreground-muted">{user.generations} gerações</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-accent-gold">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground-muted text-center py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
