"use client"

import { useState, useEffect } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Sparkles, Wand2, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react'
import { Asset } from '@/lib/types/projects'
import { useGenerations, type GenerationRequest } from '@/hooks/useGenerations'
import { motion, AnimatePresence } from 'framer-motion'

interface GenerationPanelProps {
  projectId: string
  userPhotos: Asset[]
  references: Asset[]
  onGenerationComplete?: () => void
}

export function GenerationPanel({ 
  projectId, 
  userPhotos, 
  references, 
  onGenerationComplete 
}: GenerationPanelProps) {
  const { startGeneration, generating, pollGenerationStatus } = useGenerations(projectId)
  const [selectedUserPhotos, setSelectedUserPhotos] = useState<string[]>([])
  const [selectedReference, setSelectedReference] = useState<string>('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [currentGeneration, setCurrentGeneration] = useState<any>(null)
  const [showPromptPreview, setShowPromptPreview] = useState(false)

  // Auto-select first photo and reference if available
  useEffect(() => {
    if (userPhotos.length > 0 && selectedUserPhotos.length === 0) {
      setSelectedUserPhotos([userPhotos[0].id])
    }
    if (references.length > 0 && !selectedReference) {
      setSelectedReference(references[0].id)
    }
  }, [userPhotos, references, selectedUserPhotos.length, selectedReference])

  const canGenerate = selectedUserPhotos.length > 0 && selectedReference && !generating

  const handleGenerate = async () => {
    if (!canGenerate) return

    const request: GenerationRequest = {
      userPhotoIds: selectedUserPhotos,
      referenceId: selectedReference,
      customInstructions: customInstructions.trim() || undefined,
    }

    const generation = await startGeneration(request)
    
    if (generation) {
      setCurrentGeneration(generation)
      
      // Start polling for status updates
      const stopPolling = pollGenerationStatus(generation.id)
      
      // Auto-stop polling after 5 minutes
      setTimeout(stopPolling, 5 * 60 * 1000)
      
      if (onGenerationComplete) {
        onGenerationComplete()
      }
    }
  }

  const toggleUserPhoto = (photoId: string) => {
    setSelectedUserPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId)
      } else {
        return [...prev, photoId]
      }
    })
  }

  if (userPhotos.length === 0 || references.length === 0) {
    return (
      <Card variant="glass" padding="lg">
        <CardContent className="text-center py-8">
          <Sparkles className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            Pronto para gerar?
          </h3>
          <p className="text-foreground-muted">
            {userPhotos.length === 0 && references.length === 0
              ? 'Adicione suas fotos e uma referência para começar'
              : userPhotos.length === 0
              ? 'Adicione pelo menos uma foto sua'
              : 'Adicione uma imagem de referência'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-accent-gold" />
          Geração de Retrato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* User Photo Selection */}
        <div>
          <h4 className="font-medium text-foreground mb-3">
            Selecione suas fotos ({selectedUserPhotos.length}/{userPhotos.length})
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {userPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedUserPhotos.includes(photo.id)
                    ? 'border-accent-gold'
                    : 'border-border hover:border-accent-gold/50&apos;
                }`}
                onClick={() => toggleUserPhoto(photo.id)}
              >
                <img
                  src={photo.url}
                  alt={photo.filename || 'User photo'}
                  className="aspect-square object-cover"
                />
                {selectedUserPhotos.includes(photo.id) && (
                  <div className="absolute inset-0 bg-accent-gold/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-accent-gold" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reference Selection */}
        <div>
          <h4 className="font-medium text-foreground mb-3">
            Referência de estilo
          </h4>
          <div className=&ldquo;grid grid-cols-2 gap-3&rdquo;>
            {references.map((reference) => (
              <div
                key={reference.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedReference === reference.id
                    ? 'border-accent-gold'
                    : 'border-border hover:border-accent-gold/50&apos;
                }`}
                onClick={() => setSelectedReference(reference.id)}
              >
                <img
                  src={reference.url}
                  alt={reference.filename || 'Reference'}
                  className="aspect-[4/3] object-cover"
                />
                {selectedReference === reference.id && (
                  <div className="absolute inset-0 bg-accent-gold/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-accent-gold" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <h4 className="font-medium text-foreground mb-3">
            Instruções personalizadas (opcional)
          </h4>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Ex: mais dramático, luz suave, expressão séria..."
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-foreground-muted mt-1">
            {customInstructions.length}/200 caracteres
          </p>
        </div>

        {/* Generation Status */}
        <AnimatePresence>
          {currentGeneration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-lg border border-border bg-surface"
            >
              <div className="flex items-center gap-3">
                {currentGeneration.status === 'processing' && (
                  <>
                    <div className="w-5 h-5 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="font-medium text-foreground">Gerando seu retrato...</p>
                      <p className="text-sm text-foreground-muted">Isso pode levar até 90 segundos</p>
                    </div>
                  </>
                )}
                {currentGeneration.status === 'completed' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">Geração concluída!</p>
                      <p className="text-sm text-foreground-muted">Sua nova imagem está pronta</p>
                    </div>
                  </>
                )}
                {currentGeneration.status === 'failed' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-error" />
                    <div>
                      <p className="font-medium text-foreground">Geração falhou</p>
                      <p className="text-sm text-foreground-muted">
                        {currentGeneration.error_message || 'Erro desconhecido'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPromptPreview(!showPromptPreview)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            {showPromptPreview ? 'Ocultar' : 'Preview'} Prompt
          </Button>

          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!canGenerate}
            leftIcon={generating ? undefined : <Sparkles className="w-4 h-4" />}
          >
            {generating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Gerando...
              </div>
            ) : (
              'Gerar Retrato'
            )}
          </Button>
        </div>

        {/* Prompt Preview */}
        <AnimatePresence>
          {showPromptPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-border rounded-lg p-4 bg-surface"
            >
              <h5 className="font-medium text-foreground mb-2">Preview do Prompt:</h5>
              <pre className=&ldquo;text-sm text-foreground-muted whitespace-pre-wrap&rdquo;>
                {`Ultra-realistic editorial portrait, vertical format
soft diffused window light with warm tone shadows
captured on 85mm lens at f/1.8, shallow depth of field
eye-level, subject centered with natural headroom
a person with natural features, subtle confident expression, wearing elegant attire
visible skin pores, natural fabric texture, soft material details
background: softly blurred with professional studio ambiance
subtle film grain, natural lens characteristics
color palette: natural skin tones with balanced color temperature
with a cinematic, professional atmosphere, editorial lighting that enhances natural beauty
same style, same lighting, same mood`}
              </pre>
              <p className="text-xs text-foreground-subtle mt-2">
                * Este é um preview. O prompt final será otimizado pelo DiretorVisual agent baseado na sua referência.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
