"use client"

import { useAuth } from '@/hooks/useAuth'
import { useProject } from '@/hooks/useProjects'
import { useAssets } from '@/hooks/useAssets'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { UploadDropzone } from '@/components/upload/UploadDropzone'
import { ArrowLeft, Upload, Image as ImageIcon, Sparkles, Download, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function ProjectPageSimple() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const { project, loading, error, refetch: refetchProject } = useProject(projectId)
  const { assets: userPhotos, refetch: refetchUserPhotos } = useAssets(projectId, 'user_photo')
  const { assets: references, refetch: refetchReferences } = useAssets(projectId, 'reference')
  const { assets: generated, refetch: refetchGenerated } = useAssets(projectId, 'generated')
  
  const [showUserUpload, setShowUserUpload] = useState(false)
  const [showReferenceUpload, setShowReferenceUpload] = useState(false)

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

  const hasUserPhotos = userPhotos.length > 0
  const hasReferences = references.length > 0
  const hasGenerated = generated.length > 0
  const canGenerate = hasUserPhotos && hasReferences

  const handleUserUploadComplete = () => {
    setShowUserUpload(false)
    refetchUserPhotos()
    refetchProject()
  }

  const handleReferenceUploadComplete = () => {
    setShowReferenceUpload(false)
    refetchReferences()
    refetchProject()
  }

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
                onClick={() => router.push('/projects')}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Projetos
              </Button>
              <div>
                <h1 className="font-heading text-xl font-bold text-foreground">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-sm text-foreground-muted">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                disabled={!canGenerate}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {!hasUserPhotos 
                  ? 'Adicione fotos suas'
                  : !hasReferences 
                  ? 'Adicione uma referência'
                  : 'Gerar Retrato'
                }
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Sections */}
          {showUserUpload && (
            <UploadDropzone
              projectId={projectId}
              type="user_photo"
              onUploadComplete={handleUserUploadComplete}
              maxFiles={5}
            />
          )}

          {showReferenceUpload && (
            <UploadDropzone
              projectId={projectId}
              type="reference"
              onUploadComplete={handleReferenceUploadComplete}
              maxFiles={1}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Photos */}
            <div className="space-y-6">
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-accent-gold" />
                      Suas Fotos ({userPhotos.length})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUserUpload(!showUserUpload)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {userPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url}
                            alt={photo.filename || 'User photo'}
                            className="aspect-square object-cover rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" className="text-white">
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-white text-error">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                      <p className="text-foreground-muted mb-4">
                        Adicione de 1 a 5 fotos suas
                      </p>
                      <Button 
                        variant="outline" 
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowUserUpload(true)}
                      >
                        Enviar Fotos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* References */}
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-accent-gold" />
                      Referências ({references.length})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReferenceUpload(!showReferenceUpload)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {references.length > 0 ? (
                    <div className="space-y-3">
                      {references.map((reference) => (
                        <div key={reference.id} className="relative group">
                          <img
                            src={reference.url}
                            alt={reference.filename || 'Reference'}
                            className="w-full aspect-[4/3] object-cover rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" className="text-white">
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-white text-error">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                      <p className="text-foreground-muted mb-4">
                        Adicione imagens de referência
                      </p>
                      <Button 
                        variant="outline" 
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowReferenceUpload(true)}
                      >
                        Enviar Referência
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Generated Images */}
            <div className="lg:col-span-2">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-gold" />
                    Imagens Geradas ({generated.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generated.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generated.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt="Generated image"
                            className="w-full aspect-[3/4] object-cover rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" className="text-white">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-white">
                              <Sparkles className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Sparkles className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                        Nenhuma imagem gerada ainda
                      </h3>
                      <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                        {!hasUserPhotos && !hasReferences
                          ? 'Adicione suas fotos e uma referência para começar a gerar retratos'
                          : !hasUserPhotos
                          ? 'Adicione pelo menos uma foto sua para gerar retratos'
                          : !hasReferences
                          ? 'Adicione uma imagem de referência para definir o estilo'
                          : 'Tudo pronto! Clique em "Gerar Retrato" para criar sua primeira imagem'
                        }
                      </p>
                      {canGenerate && (
                        <Button
                          variant="primary"
                          leftIcon={<Sparkles className="w-4 h-4" />}
                        >
                          Gerar Primeiro Retrato
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
