"use client"

import { Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AppHeader } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState } from 'react'

function SettingsContent() {
  const { user, profile } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  })
  const [preferences, setPreferences] = useState({
    autoSave: true,
    highQuality: true,
    darkMode: true
  })

  const handleSaveProfile = () => {
    // TODO: Implement profile save logic
    console.log('Saving profile...')
  }

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Exporting data...')
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      console.log('Deleting account...')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Acesso Negado
            </h1>
            <p className="text-foreground-muted mb-6">
              Você precisa estar logado para acessar as configurações.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configurações
          </h1>
          <p className="text-foreground-muted">
            Gerencie suas preferências e configurações da conta.
          </p>
        </div>

        {/* Perfil do Usuário */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  defaultValue={profile?.full_name || ''}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email || ''}
                  disabled
                  className="opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Conte um pouco sobre você..."
                defaultValue=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite uma nova senha (opcional)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notificações por Email</Label>
                <p className="text-sm text-foreground-muted">
                  Receba atualizações importantes por email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notificações Push</Label>
                <p className="text-sm text-foreground-muted">
                  Receba notificações no navegador
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Marketing</Label>
                <p className="text-sm text-foreground-muted">
                  Receba dicas, novidades e ofertas especiais
                </p>
              </div>
              <Switch
                checked={notifications.marketing}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Salvamento Automático</Label>
                <p className="text-sm text-foreground-muted">
                  Salve automaticamente seu trabalho
                </p>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, autoSave: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alta Qualidade</Label>
                <p className="text-sm text-foreground-muted">
                  Gerar imagens em máxima qualidade (mais lento)
                </p>
              </div>
              <Switch
                checked={preferences.highQuality}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, highQuality: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Modo Escuro</Label>
                <p className="text-sm text-foreground-muted">
                  Interface com tema escuro
                </p>
              </div>
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidade e Segurança */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacidade e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.href = '/privacy'}
                className="w-full"
              >
                <Shield className="w-4 h-4 mr-2" />
                Política de Privacidade
              </Button>
            </div>

            <Separator />

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <h4 className="font-medium text-destructive">
                    Zona de Perigo
                  </h4>
                  <p className="text-sm text-foreground-muted">
                    Excluir sua conta removerá permanentemente todos os seus dados, 
                    projetos e imagens. Esta ação não pode ser desfeita.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Conta */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-foreground-muted">Plano Atual</p>
                <p className="font-medium text-foreground">
                  {profile?.plan === 'pro' ? 'Pro' : 'Gratuito'}
                </p>
              </div>
              
              <div>
                <p className="text-foreground-muted">Membro desde</p>
                <p className="font-medium text-foreground">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-foreground-muted">ID do Usuário</p>
                <p className="font-medium text-foreground font-mono text-xs">
                  {user.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-surface animate-pulse rounded"></div>
          <div className="h-4 bg-surface animate-pulse rounded w-1/2"></div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-surface animate-pulse rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  )
}
