"use client"

import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { UserMenu } from '@/components/layout/UserMenu'
import { AuthDebug } from '@/components/debug/AuthDebug'
import { Plus, Camera, Sparkles, User, LogOut, Image, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const { projects, createProject } = useProjects()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  // Redirect to login if not authenticated and not loading
  if (!loading && !user) {
    router.push('/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleCreateProject = async () => {
    setIsCreating(true)
    
    const projectName = `Projeto ${projects.length + 1}`
    const project = await createProject({ name: projectName })
    
    if (project) {
      router.push(`/projects/${project.id}`)
    }
    
    setIsCreating(false)
  }

  // Calculate stats
  const totalProjects = projects.length
  const totalAssets = projects.reduce((sum, project) => sum + project.asset_count, 0)
  const totalGenerations = 0 // TODO: Implementar quando tiver tabela de generations
  const recentProjects = projects.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Retrat.ai
              </h1>
              <span className="text-foreground-muted">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              {/* User Menu */}
              {user && (
                <UserMenu 
                  user={user}
                  profile={profile}
                  onSignOut={handleSignOut}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-foreground-muted">
            Ready to create some amazing portraits? Let's get started.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="glass" hover className="cursor-pointer" onClick={handleCreateProject}>
            <CardHeader>
              <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                <Plus className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
              </div>
              <CardTitle className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Novo Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted text-sm mb-4">
                Comece um novo projeto de geração de retratos
              </p>
              <Button variant="primary" className="w-full" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar Projeto'}
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass" hover className="cursor-pointer" onClick={() => router.push('/projects')}>
            <CardHeader>
              <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                <Camera className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
              </div>
              <CardTitle className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Meus Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted text-sm mb-4">
                Veja e gerencie todos os seus projetos
              </p>
              <Button variant="outline" className="w-full">
                Ver Projetos
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass" hover className="cursor-pointer" onClick={() => router.push('/gallery')}>
            <CardHeader>
              <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                <Sparkles className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
              </div>
              <CardTitle className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Galeria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted text-sm mb-4">
                Veja seus retratos gerados
              </p>
              <Button variant="outline" className="w-full">
                Ver Galeria
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
              <p className="text-sm text-foreground-muted">Projetos</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalAssets}</p>
              <p className="text-sm text-foreground-muted">Fotos Enviadas</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalGenerations}</p>
              <p className="text-sm text-foreground-muted">Gerações</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-gold">
                {profile?.plan === 'pro' ? '∞' : '5'}
              </p>
              <p className="text-sm text-foreground-muted">Cota Semanal</p>
            </div>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card variant="glass" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projetos Recentes</CardTitle>
              {totalProjects > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/projects')}
                >
                  Ver todos
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentProjects.map((project) => (
                  <Card
                    key={project.id}
                    variant="elevated"
                    hover
                    className="cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div className="aspect-[4/3] bg-surface rounded-lg mb-3 flex items-center justify-center">
                      <Image className="w-8 h-8 text-foreground-muted" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground truncate">
                        {project.name}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-foreground-muted">
                        <span>{project.asset_count} imagens</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-muted mb-4">
                  Nenhum projeto ainda. Crie seu primeiro projeto para começar!
                </p>
                <Button
                  variant="primary"
                  onClick={handleCreateProject}
                  disabled={isCreating}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  {isCreating ? 'Criando...' : 'Criar Primeiro Projeto'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Debug Component */}
      <AuthDebug />
    </div>
  )
}
