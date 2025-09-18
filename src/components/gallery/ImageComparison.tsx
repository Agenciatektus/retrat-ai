"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, ZoomIn, ZoomOut, Move, Grid, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { GalleryImage } from './ImageGallery'

interface ImageComparisonProps {
  images: GalleryImage[]
  mode?: 'side-by-side' | 'overlay' | 'slider'
  onClose?: () => void
  className?: string
}

export function ImageComparison({ 
  images, 
  mode = 'side-by-side', 
  onClose,
  className 
}: ImageComparisonProps) {
  const [currentMode, setCurrentMode] = useState(mode)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Limit to 2 images for comparison
  const [imageA, imageB] = images.slice(0, 2)

  useEffect(() => {
    if (currentMode === 'slider' && sliderRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging && sliderRef.current) {
          const rect = sliderRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
          setSliderPosition(percentage)
        }
      }

      const handleMouseUp = () => setIsDragging(false)

      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, currentMode])

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))
  const handleResetZoom = () => setZoom(1)

  if (!imageA || !imageB) {
    return (
      <Card variant="glass" padding="lg" className={`text-center ${className}`}>
        <p className="text-foreground-muted">
          Selecione pelo menos 2 imagens para comparar
        </p>
      </Card>
    )
  }

  return (
    <Card variant="glass" className={`overflow-hidden ${className}`}>
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-accent-gold" />
            Comparação de Imagens
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              {[
                { key: 'side-by-side', label: 'Lado a Lado', icon: Grid },
                { key: 'slider', label: 'Slider', icon: Move }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={currentMode === key ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentMode(key as typeof currentMode)}
                  leftIcon={<Icon className="w-4 h-4" />}
                  className="rounded-none border-0"
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border border-border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="rounded-none border-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <div className="px-2 py-1 text-sm text-foreground-muted min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="rounded-none border-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="rounded-none border-0"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {currentMode === 'side-by-side' && (
          <div className="grid grid-cols-2 h-96">
            {/* Image A */}
            <div className="relative border-r border-border overflow-hidden">
              <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
                Imagem A
              </div>
              <div 
                className="w-full h-full overflow-hidden cursor-move"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={imageA.url}
                  alt={imageA.filename || 'Image A'}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            </div>

            {/* Image B */}
            <div className="relative overflow-hidden">
              <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
                Imagem B
              </div>
              <div 
                className="w-full h-full overflow-hidden cursor-move"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={imageB.url}
                  alt={imageB.filename || 'Image B'}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        )}

        {currentMode === 'slider' && (
          <div 
            ref={sliderRef}
            className="relative h-96 overflow-hidden cursor-col-resize"
            onMouseDown={() => setIsDragging(true)}
          >
            {/* Base Image (Image A) */}
            <div 
              className="absolute inset-0"
              style={{ transform: `scale(${zoom})` }}
            >
              <img
                src={imageA.url}
                alt={imageA.filename || 'Base image'}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
                Imagem A
              </div>
            </div>

            {/* Overlay Image (Image B) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ 
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                transform: `scale(${zoom})`
              }}
            >
              <img
                src={imageB.url}
                alt={imageB.filename || 'Overlay image'}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
                Imagem B
              </div>
            </div>

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-accent-gold cursor-col-resize z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-accent-gold rounded-full flex items-center justify-center shadow-lg">
                <Move className="w-4 h-4 text-black" />
              </div>
            </div>

            {/* Slider Labels */}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs">
              {Math.round(sliderPosition)}% - {Math.round(100 - sliderPosition)}%
            </div>
          </div>
        )}

        {/* Image Info */}
        <div className="p-4 border-t border-border bg-surface/50">
          <div className="grid grid-cols-2 gap-4 text-xs text-foreground-muted">
            <div>
              <p className="font-medium text-foreground mb-1">Imagem A</p>
              <p>{imageA.filename || 'Sem nome'}</p>
              <p>{new Date(imageA.created_at).toLocaleDateString('pt-BR')}</p>
              {imageA.metadata?.model && (
                <p className="text-accent-gold">{imageA.metadata.model}</p>
              )}
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Imagem B</p>
              <p>{imageB.filename || 'Sem nome'}</p>
              <p>{new Date(imageB.created_at).toLocaleDateString('pt-BR')}</p>
              {imageB.metadata?.model && (
                <p className="text-accent-gold">{imageB.metadata.model}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

