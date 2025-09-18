"use client"

import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Image, 
  Zap, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Database,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AdminStats {
  totalUsers: number
  totalProjects: number
  totalGenerations: number
  totalRevenue: number
  activeSubscriptions: number
  errorRate: number
  avgGenerationTime: number
  storageUsed: number
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Check admin access
  const isAdmin = profile?.email === 'peterson@agenciatektus.com.br' || profile?.plan === 'admin'

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      loadAdminStats()
    }
  }, [user, profile, loading, isAdmin, router])

  const loadAdminStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/admin/stats')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading admin stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Verificando permissões...</p>
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
              <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-3">
                <Shield className="w-8 h-8 text-accent-gold" />
                Admin Panel
              </h1>
              <p className="text-foreground-muted mt-2">
                Analytics, Monitoring e Controle do Sistema
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">Total de Usuários</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : stats?.totalUsers || 0}
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
                  <p className="text-sm text-foreground-muted">Projetos Criados</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : stats?.totalProjects || 0}
                  </p>
                </div>
                <Image className="w-8 h-8 text-accent-gold" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">Gerações de IA</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : stats?.totalGenerations || 0}
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
                  <p className="text-sm text-foreground-muted">Receita Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {statsLoading ? '...' : (stats?.totalRevenue || 0).toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-accent-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics & Monitoring Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* External Analytics */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-gold" />
                Analytics Externos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <a
                  href="https://app.posthog.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent-gold/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-gold-muted rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">PostHog Analytics</p>
                      <p className="text-sm text-foreground-muted">Eventos, funis e conversão</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Acessar</Button>
                </a>

                <a
                  href="https://sentry.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent-gold/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-gold-muted rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Sentry Monitoring</p>
                      <p className="text-sm text-foreground-muted">Erros e performance</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Acessar</Button>
                </a>

                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent-gold/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-gold-muted rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Stripe Dashboard</p>
                      <p className="text-sm text-foreground-muted">Pagamentos e assinaturas</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Acessar</Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-gold" />
                Saúde do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-foreground">API Status</span>
                  </div>
                  <span className="text-sm text-success font-medium">Online</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-foreground">Database</span>
                  </div>
                  <span className="text-sm text-success font-medium">Conectado</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-sm text-foreground">Taxa de Erro</span>
                  </div>
                  <span className="text-sm text-warning font-medium">
                    {statsLoading ? '...' : `${(stats?.errorRate || 0).toFixed(2)}%`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-info rounded-full"></div>
                    <span className="text-sm text-foreground">Tempo Médio de Geração</span>
                  </div>
                  <span className=&ldquo;text-sm text-info font-medium&rdquo;>
                    {statsLoading ? '...&apos; : `${stats?.avgGenerationTime || 0}s`}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={loadAdminStats}
                disabled={statsLoading}
              >
                {statsLoading ? 'Carregando...' : 'Atualizar Métricas'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-gold" />
                Analytics Interno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted mb-4">
                Visualize métricas detalhadas do sistema
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/admin/analytics')}
              >
                Ver Analytics
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-gold" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted mb-4">
                Controle de usuários e planos
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/admin/users')}
              >
                Ver Usuários
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-accent-gold" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted mb-4">
                Configurações e manutenção
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/admin/system')}
              >
                Ver Sistema
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
