"use client"

import { useState } from 'react'
import { Button, Card, CardContent } from '@/components/ui'
import { X, Download, Sparkles, ZoomIn, ZoomOut } from 'lucide-react'
import { Asset } from '@/lib/types/projects'
import { motion, AnimatePresence } from 'framer-motion'

interface ImagePreviewProps {
  asset: Asset | null
  onClose: () => void
  onDownload?: (asset: Asset) => void
  onGenerateVariation?: (asset: Asset) => void
}

export function ImagePreview({ 
  asset, 
  onClose, 
  onDownload, 
  onGenerateVariation 
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1)

  if (!asset) return null

  const handleDownload = () => {
    if (onDownload) {
      onDownload(asset)
    } else {
      // Default download behavior
      const link = document.createElement('a')
      link.href = asset.url
      link.download = asset.filename || `retrat-ai-${asset.id}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-4xl max-h-[90vh] w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Card variant="glass" padding="none" className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-medium text-foreground">
                  {asset.filename || 'Imagem'}
                </h3>
                <p className="text-sm text-foreground-muted">
                  {asset.metadata?.width && asset.metadata?.height
                    ? `${asset.metadata.width} × ${asset.metadata.height} px`
                    : 'Dimensões não disponíveis'
                  }
                  {asset.size && ` • ${(asset.size / 1024 / 1024).toFixed(1)} MB`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-foreground-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Image Container */}
            <div className="relative overflow-hidden bg-background">
              <div 
                className="flex items-center justify-center min-h-[400px] max-h-[60vh] overflow-auto"
                style={{ padding: '20px' }}
              >
                <img
                  src={asset.url}
                  alt={asset.filename || 'Preview'}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ 
                    transform: `scale(${zoom})`,
                    cursor: zoom > 1 ? 'grab' : 'default'
                  }}
                />
              </div>

              {/* Zoom Controls */}
              {zoom !== 1 && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-foreground-muted">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {asset.type === 'generated' && onGenerateVariation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateVariation(asset)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Variação
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

