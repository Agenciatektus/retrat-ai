'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Camera, Palette, Lightbulb, Eye, Sparkles } from 'lucide-react'
import { PhotographyAnalysis } from '@/lib/agents/photography-analyzer'

interface ReferenceAnalyzerProps {
  projectId: string
  referenceImageUrl: string
  onAnalysisComplete: (analysis: PhotographyAnalysis) => void
  className?: string
}

export function ReferenceAnalyzer({ 
  projectId, 
  referenceImageUrl, 
  onAnalysisComplete,
  className = ''
}: ReferenceAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PhotographyAnalysis | null>(null)
  const [userContext, setUserContext] = useState('')
  const [showVariations, setShowVariations] = useState(false)
  const [variations, setVariations] = useState<Record<string, string> | null>(null)

  const handleAnalyze = async () => {
    if (!referenceImageUrl) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze/reference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: referenceImageUrl,
          projectId,
          userContext: userContext || undefined,
          generateVariations: showVariations
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze reference')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setVariations(data.variations)
      onAnalysisComplete(data.analysis)
    } catch (error) {
      console.error('Error analyzing reference:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Análise de Referência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Análise de Referência Fotográfica
          </CardTitle>
          <CardDescription>
            Use nossa base de conhecimento fotográfico para extrair padrões técnicos e estéticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contexto do usuário */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Contexto adicional (opcional)
            </label>
            <Textarea
              placeholder="Descreva o que você quer destacar na análise ou o resultado desejado..."
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Opções */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showVariations}
                onChange={(e) => setShowVariations(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Gerar variações de estilo</span>
            </label>
          </div>

          {/* Botão de análise */}
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !referenceImageUrl}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando padrões fotográficos...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analisar Referência
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados da Análise */}
      {analysis && (
        <div className="space-y-4">
          {/* Confiança geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Análise Fotográfica</span>
                <Badge variant={analysis.confidence > 0.8 ? 'default' : 'secondary'}>
                  {Math.round(analysis.confidence * 100)}% confiança
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estilo Visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Estilo Visual
                  </h4>
                  <div className="space-y-1">
                    <Badge variant="outline">{analysis.visualStyle.primary}</Badge>
                    {analysis.visualStyle.secondary && (
                      <Badge variant="outline" className="ml-2">
                        {analysis.visualStyle.secondary}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {analysis.visualStyle.characteristics.join(', ')}
                  </div>
                </div>

                {/* Configuração Técnica */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Setup Técnico
                  </h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Câmera:</strong> {analysis.camera.body}</div>
                    <div><strong>Lente:</strong> {analysis.camera.lens}</div>
                    <div><strong>Abertura:</strong> {analysis.camera.aperture}</div>
                    <div><strong>Enquadramento:</strong> {analysis.technical.framing}</div>
                  </div>
                </div>
              </div>

              {/* Composição */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Composição & Ângulo
                </h4>
                <div className="text-sm">
                  <strong>Ângulo:</strong> {analysis.composition.angle} • 
                  <strong> POV:</strong> {analysis.composition.pointOfView}
                </div>
                <div className="text-sm text-gray-600">
                  {analysis.composition.emotionalImpact}
                </div>
              </div>

              {/* Paleta de Cores */}
              <div className="space-y-2">
                <h4 className="font-medium">Paleta de Cores</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.colorPalette.dominant.map((color, index) => (
                    <Badge key={index} variant="outline">{color}</Badge>
                  ))}
                  {analysis.colorPalette.accent.map((color, index) => (
                    <Badge key={`accent-${index}`} variant="secondary">{color}</Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Temperatura:</strong> {analysis.colorPalette.temperature} • 
                  <strong> Mood:</strong> {analysis.colorPalette.mood}
                </div>
              </div>

              {/* Atmosfera */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Atmosfera & Mood
                </h4>
                <div className="text-sm">
                  <div><strong>Mood:</strong> {analysis.atmosphere.mood}</div>
                  <div><strong>Emoção:</strong> {analysis.atmosphere.emotion}</div>
                  <div><strong>Narrativa:</strong> {analysis.atmosphere.narrative}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Prompt */}
          <Card>
            <CardHeader>
              <CardTitle>Master Prompt Gerado</CardTitle>
              <CardDescription>
                Prompt técnico otimizado baseado na análise fotográfica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {analysis.masterPrompt}
                </pre>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigator.clipboard.writeText(analysis.masterPrompt)}
              >
                Copiar Prompt
              </Button>
            </CardContent>
          </Card>

          {/* Variações de Estilo */}
          {variations && (
            <Card>
              <CardHeader>
                <CardTitle>Variações de Estilo</CardTitle>
                <CardDescription>
                  Adaptações do prompt para diferentes estilos visuais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(variations).map(([styleName, prompt]) => (
                  <div key={styleName} className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2 capitalize">
                      {styleName.replace(/_/g, ' ')}
                    </h5>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap font-mono">
                        {prompt}
                      </pre>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(prompt)}
                    >
                      Copiar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
