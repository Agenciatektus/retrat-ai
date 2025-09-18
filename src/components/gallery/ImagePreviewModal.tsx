"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Heart,
  Star,
  Trash,
  RotateCcw,
  Share,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { GalleryImage } from './ImageGallery'

interface ImagePreviewModalProps {
  image: GalleryImage | null
  isOpen: boolean
  onClose: () => void
  onFavorite?: (imageId: string, isFavorite: boolean) => void
  onRate?: (imageId: string, rating: number) => void
  onDownload?: (imageId: string) => void
  onDelete?: (imageId: string) => void
  onExport?: (image: GalleryImage) => void
}

export function ImagePreviewModal({
  image,
  isOpen,
  onClose,
  onFavorite,
  onRate,
  onDownload,
  onDelete,
  onExport
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showInfo, setShowInfo] = useState(false)

  // Reset zoom and position when modal opens or image changes
  useEffect(() => {
    if (isOpen && image) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setShowInfo(false)
    }
  }, [isOpen, image])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          handleResetZoom()
          break
        case 'i':
          setShowInfo(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleFavorite = () => {
    if (image && onFavorite) {
      onFavorite(image.id, !image.is_favorite)
    }
  }

  const handleDownload = () => {
    if (image && onDownload) {
      onDownload(image.id)
    }
  }

  const handleExport = () => {
    if (image && onExport) {
      onExport(image)
    }
  }

  const handleDelete = () => {
    if (image && onDelete) {
      if (window.confirm('Tem certeza que deseja deletar esta imagem?')) {
        onDelete(image.id)
        onClose()
      }
    }
  }

  const handleRate = (rating: number) => {
    if (image && onRate) {
      onRate(image.id, rating)
    }
  }

  const StarRating = ({ rating = 0 }: { rating?: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          className="text-accent-gold hover:text-accent-gold-hover transition-colors"
        >
          <Star
            className={`w-4 h-4 ${star <= rating ? 'fill-current' : ''}`}
          />
        </button>
      ))}
    </div>
  )

  if (!image) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                  onClick={handleResetZoom}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                  onClick={handleZoomIn}
                  disabled={zoom >= 5}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded text-white text-sm">
                  {Math.round(zoom * 100)}%
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Container */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <motion.img
                src={image.url}
                alt={image.filename || 'Generated image'}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center'
                }}
                draggable={false}
                onDoubleClick={zoom === 1 ? handleZoomIn : handleResetZoom}
              />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center">
              <div className="flex gap-2">
                {onFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                    onClick={handleFavorite}
                  >
                    <Heart className={`w-4 h-4 ${
                      image.is_favorite ? 'fill-accent-gold text-accent-gold' : ''
                    }`} />
                  </Button>
                )}

                {onRate && (
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded flex items-center gap-2">
                    <StarRating rating={image.rating} />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {onExport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                    onClick={handleExport}
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                )}

                {onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 backdrop-blur-sm text-white hover:bg-error/70"
                    onClick={handleDelete}
                  >
                    <Trash className="w-4 h-4 text-error" />
                  </Button>
                )}
              </div>
            </div>

            {/* Info Panel */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  className="absolute left-4 top-20 bottom-20 w-80 z-20"
                >
                  <Card variant="glass" padding="lg" className="h-full overflow-y-auto">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">
                        Informações da Imagem
                      </h3>

                      {image.filename && (
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">Nome do Arquivo</p>
                          <p className="text-sm text-foreground">{image.filename}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-foreground-muted mb-1">Criado em</p>
                        <p className="text-sm text-foreground">
                          {new Date(image.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      {image.metadata?.model && (
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">Modelo</p>
                          <p className="text-sm text-foreground">{image.metadata.model}</p>
                        </div>
                      )}

                      {image.metadata?.width && image.metadata?.height && (
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">Dimensões</p>
                          <p className="text-sm text-foreground">
                            {image.metadata.width} × {image.metadata.height}
                          </p>
                        </div>
                      )}

                      {image.metadata?.prompt && (
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">Prompt</p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {image.metadata.prompt}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Help */}
            <div className="absolute bottom-16 right-4 text-white/60 text-xs space-y-1">
              <p>ESC - Fechar | + - Zoom in | - - Zoom out</p>
              <p>0 - Reset zoom | I - Info | Duplo clique - Zoom</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


