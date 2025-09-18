"use client"

import { useProject } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useGeneration } from '@/hooks/useGeneration'
import { useGallery } from '@/hooks/useGallery'
import { Button, Card, CardHeader, CardTitle, CardContent, FileUpload } from '@/components/ui'
import { ImageGallery, BatchOperations, ImageComparison } from '@/components/gallery'
import { ExportModal } from '@/components/export/ExportModal'
import { ArrowLeft, Upload, Image, Sparkles, Download, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

export default function ProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const { project, loading, error, refetch } = useProject(projectId)
  const {
    startGeneration,
    currentGeneration,
    loading: generationLoading,
    error: generationError,
    usage,
    canGenerate
  } = useGeneration()

  const {
    downloadImage,
    favoriteImage,
    rateImage,
    deleteImage,
    loading: galleryLoading,
    error: galleryError
  } = useGallery()

  const handleGenerateRetratos = async () => {
    if (!project || !canGenerate()) return

    const referenceImageIds = project.references.map(ref => ref.id)
    const userPhotoIds = project.user_photos.map(photo => photo.id)

    const generation = await startGeneration({
      projectId: project.id,
      referenceImageIds,
      userPhotoIds,
      model: 'sdxl',
      numImages: 2,
      style: 'editorial'
    })

    if (generation) {
      // Optionally redirect to a generation status page or show progress
      console.log('Generation started:', generation.id)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Erro ao carregar projeto</h2>
          <p className="text-foreground-muted">{error}</p>
          <Button
            variant="primary"
            onClick={() => router.push('/projects')}
          >
            Voltar aos Projetos
          </Button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Projeto não encontrado</h2>
          <p className="text-foreground-muted">O projeto que você está procurando não existe.</p>
          <Button
            variant="primary"
            onClick={() => router.push('/projects')}
          >
            Voltar aos Projetos
          </Button>
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
                onClick={() => router.push('/projects')}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Projetos
              </Button>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-foreground-muted text-sm">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/projects/${projectId}/edit`)}
              >
                Editar
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                disabled={
                  project.user_photos.length === 0 ||
                  project.references.length === 0 ||
                  generationLoading ||
                  !canGenerate()
                }
                onClick={handleGenerateRetratos}
              >
                {generationLoading ? 'Gerando...' : 'Gerar Retratos'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{project.user_photos.length}</p>
              <p className="text-sm text-foreground-muted">Suas Fotos</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{project.references.length}</p>
              <p className="text-sm text-foreground-muted">Referências</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{project.generated_images.length}</p>
              <p className="text-sm text-foreground-muted">Gerados</p>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-gold">{project.asset_count}</p>
              <p className="text-sm text-foreground-muted">Total</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Photos Section */}
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent-gold" />
                Suas Fotos ({project.user_photos.length}/5)
              </CardTitle>
              <p className="text-sm text-foreground-muted">
                Envie 1-5 fotos suas para gerar os retratos
              </p>
            </CardHeader>
            <CardContent>
              <FileUpload
                maxFiles={5}
                type="user_photo"
                variant="compact"
                projectId={projectId}
                existingFiles={project.user_photos}
                onUpload={async () => {
                  // Refetch project data after upload
                  await refetch()
                }}
              />
            </CardContent>
          </Card>

          {/* References Section */}
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-accent-gold" />
                Referências ({project.references.length}/3)
              </CardTitle>
              <p className="text-sm text-foreground-muted">
                Adicione imagens de referência do estilo desejado
              </p>
            </CardHeader>
            <CardContent>
              <FileUpload
                maxFiles={3}
                type="reference"
                variant="compact"
                projectId={projectId}
                existingFiles={project.references}
                onUpload={async () => {
                  // Refetch project data after upload
                  await refetch()
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Generation Status */}
        {(currentGeneration || generationError) && (
          <Card variant="glass" padding="lg" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-gold" />
                Status da Geração
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generationError && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg mb-4">
                  <p className="text-error text-sm">{generationError}</p>
                </div>
              )}

              {currentGeneration && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-muted">Status:</span>
                    <span className={`text-sm font-medium ${
                      currentGeneration.status === 'succeeded' ? 'text-success' :
                      currentGeneration.status === 'failed' ? 'text-error' :
                      currentGeneration.status === 'canceled' ? 'text-warning' :
                      'text-accent-gold'
                    }`}>
                      {currentGeneration.status === 'starting' && 'Iniciando...'}
                      {currentGeneration.status === 'processing' && 'Processando...'}
                      {currentGeneration.status === 'succeeded' && 'Concluído!'}
                      {currentGeneration.status === 'failed' && 'Falhou'}
                      {currentGeneration.status === 'canceled' && 'Cancelado'}
                    </span>
                  </div>

                  {currentGeneration.status === 'processing' && currentGeneration.estimated_completion && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">Conclusão estimada:</span>
                      <span className="text-sm">
                        {new Date(currentGeneration.estimated_completion).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {usage && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">Cota atual:</span>
                      <span className="text-sm">
                        {usage.current}/{usage.limit} gerações
                      </span>
                    </div>
                  )}

                  {currentGeneration.status === 'processing' && (
                    <div className="w-full bg-surface-glass rounded-full h-2">
                      <div className="bg-accent-gold h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generated Images Gallery */}
        <Card variant="glass" padding="lg" className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" />
              Retratos Gerados ({project.generated_images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {galleryError && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg mb-4">
                <p className="text-error text-sm">{galleryError}</p>
              </div>
            )}

            <ImageGallery
              images={project.generated_images.map(image => ({
                id: image.id,
                url: image.url,
                filename: image.filename,
                created_at: image.created_at,
                metadata: {
                  ...image.metadata,
                  generation_id: image.metadata?.generation_id
                },
                is_favorite: image.metadata?.is_favorite || false,
                rating: image.metadata?.rating || 0
              }))}
              loading={galleryLoading}
              onDownload={async (imageId) => {
                await downloadImage(imageId)
              }}
              onFavorite={async (imageId, isFavorite) => {
                const success = await favoriteImage(imageId, isFavorite)
                if (success) {
                  await refetch() // Refresh project data to show updated favorites
                }
              }}
              onRate={async (imageId, rating) => {
                const success = await rateImage(imageId, rating)
                if (success) {
                  await refetch() // Refresh project data to show updated rating
                }
              }}
              onDelete={async (imageId) => {
                const success = await deleteImage(imageId)
                if (success) {
                  await refetch() // Refresh project data to remove deleted image
                }
              }}
              showActions={true}
              variant="grid"
            />
          </CardContent>
        </Card>

        {/* Generation CTA */}
        {project.user_photos.length > 0 && project.references.length > 0 && project.generated_images.length === 0 && (
          <Card variant="elevated" padding="lg" className="mt-8 text-center">
            <div className="space-y-4">
              <Sparkles className="w-16 h-16 text-accent-gold mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Pronto para gerar!
                </h3>
                <p className="text-foreground-muted mb-6">
                  Você tem {project.user_photos.length} fotos e {project.references.length} referências.
                  Agora podemos gerar seus retratos profissionais.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                >
                  Gerar Retratos com IA
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}