"use client"

import { useAuth } from '@/hooks/useAuth'
import { useProject, useProjects } from '@/hooks/useProjects'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function EditProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const { project, loading, error } = useProject(projectId)
  const { updateProject } = useProjects()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
    }
  }, [project])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card variant="default" className="max-w-md border-error">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-error mb-2">Erro</h2>
            <p className="text-foreground-muted mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push('/projects')}>
              Voltar aos Projetos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const handleSave = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    
    const success = await updateProject(projectId, {
      name: name.trim(),
      description: description.trim() || undefined,
    })
    
    if (success) {
      router.push(`/projects/${projectId}`)
    }
    
    setIsSaving(false)
  }

  const handleCancel = () => {
    router.push(`/projects/${projectId}`)
  }

  const isChanged = name !== project.name || description !== (project.description || '')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Cancelar
              </Button>
              <div>
                <h1 className="font-heading text-xl font-bold text-foreground">
                  Editar Projeto
                </h1>
                <p className="text-sm text-foreground-muted">
                  Altere o nome e descrição do seu projeto
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleCancel}
                leftIcon={<X className="w-4 h-4" />}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isChanged || !name.trim() || isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome do Projeto *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Editorial Urbano, Meu Book 2025"
                maxLength={100}
              />
              <p className="text-xs text-foreground-muted mt-1">
                {name.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o estilo ou objetivo deste projeto..."
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-foreground-muted mt-1">
                {description.length}/500 caracteres
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Criado em
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {new Date(project.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Última atualização
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {new Date(project.updated_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
