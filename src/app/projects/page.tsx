"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { Plus, Search, Camera, Calendar, Image, MoreVertical, Trash, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProjectsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { projects, loading, createProject, deleteProject, fetchProjects } = useProjects()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateProject = async () => {
    setIsCreating(true)

    const projectName = `Projeto ${projects.length + 1}`
    const project = await createProject({ name: projectName })

    if (project) {
      router.push(`/projects/${project.id}`)
    }

    setIsCreating(false)
  }

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto &ldquo;${projectName}&rdquo;?`)) {
      await deleteProject(projectId)
    }
  }

  const handleSearch = async (searchTerm: string) => {
    setSearch(searchTerm)
    await fetchProjects(searchTerm)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-foreground-muted hover:text-foreground"
              >
                ← Dashboard
              </Button>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Meus Projetos
              </h1>
            </div>

            <Button
              variant="primary"
              onClick={handleCreateProject}
              disabled={isCreating}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {isCreating ? 'Criando...' : 'Novo Projeto'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-md">
            <Input
              placeholder="Buscar projetos..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              variant="glass"
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Projects Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              <p className="text-sm text-foreground-muted">Total de Projetos</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {projects.reduce((sum, p) => sum + p.asset_count, 0)}
              </p>
              <p className="text-sm text-foreground-muted">Imagens Enviadas</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-gold">
                {profile?.plan === 'pro' ? '∞' : '5&apos;}
              </p>
              <p className="text-sm text-foreground-muted">Cota Semanal</p>
            </div>
          </Card>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground-muted">Carregando projetos...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                variant="glass"
                hover
                className="cursor-pointer group"
              >
                {/* Project Thumbnail */}
                <div
                  className="aspect-[4/3] bg-surface rounded-lg mb-4 flex items-center justify-center"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <Image className="w-12 h-12 text-foreground-muted" />
                </div>

                {/* Project Info */}
                <div className="space-y-3">
                  <div
                    className=&ldquo;cursor-pointer&rdquo;
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <h3 className="font-semibold text-foreground truncate">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-foreground-muted line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Project Stats */}
                  <div className="flex items-center justify-between text-sm text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {project.asset_count} imagens
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.created_at).toLocaleDateString('pt-BR&apos;)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-glass">
                    <Button
                      variant="ghost"
                      size=&ldquo;sm&rdquo;
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      Abrir
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size=&ldquo;sm&rdquo;
                        onClick={() => router.push(`/projects/${project.id}/edit`)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="text-error hover:text-error"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-foreground-muted mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {search ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda&apos;}
            </h3>
            <p className=&ldquo;text-foreground-muted mb-6 max-w-md mx-auto&rdquo;>
              {search
                ? `Não encontramos projetos com "${search}". Tente outro termo de busca.`
                : 'Você ainda não criou nenhum projeto. Comece criando seu primeiro projeto de retratos.'
              }
            </p>
            {!search && (
              <Button
                variant="primary"
                onClick={handleCreateProject}
                disabled={isCreating}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                {isCreating ? 'Criando...' : 'Criar Primeiro Projeto'}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}