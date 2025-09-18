"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Download, ZoomIn, Trash, Star, Image as ImageIcon, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ImagePreviewModal } from './ImagePreviewModal'

export interface GalleryImage {
  id: string
  url: string
  filename?: string
  created_at: string
  metadata?: {
    model?: string
    prompt?: string
    generation_id?: string
    width?: number
    height?: number
    cloudinary_public_id?: string
    public_id?: string
    [key: string]: unknown
  }
  is_favorite?: boolean
  rating?: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
  loading?: boolean
  onFavorite?: (imageId: string, isFavorite: boolean) => void
  onRate?: (imageId: string, rating: number) => void
  onDownload?: (imageId: string) => void
  onDelete?: (imageId: string) => void
  onExport?: (image: GalleryImage) => void
  onBatchSelect?: (selectedIds: string[]) => void
  className?: string
  variant?: 'grid' | 'masonry'
  showActions?: boolean
  selectable?: boolean
}

export function ImageGallery({
  images,
  loading = false,
  onFavorite,
  onRate,
  onDownload,
  onDelete,
  onExport,
  onBatchSelect,
  className,
  variant = 'grid',
  showActions = true,
  selectable = false
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  const handleImageClick = (image: GalleryImage) => {
    if (selectable) {
      toggleSelection(image.id)
    } else {
      setSelectedImage(image)
    }
  }

  const toggleSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages)

    if (newSelection.has(imageId)) {
      newSelection.delete(imageId)
    } else {
      newSelection.add(imageId)
    }

    setSelectedImages(newSelection)
    onBatchSelect?.(Array.from(newSelection))
  }

  const handleFavorite = (e: React.MouseEvent, imageId: string, currentFavorite?: boolean) => {
    e.stopPropagation()
    onFavorite?.(imageId, !currentFavorite)
  }

  const handleDownload = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation()
    onDownload?.(imageId)
  }

  const handleDelete = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation()
    if (window.confirm('Tem certeza que deseja deletar esta imagem?')) {
      onDelete?.(imageId)
    }
  }

  const handleExport = (e: React.MouseEvent, image: GalleryImage) => {
    e.stopPropagation()
    onExport?.(image)
  }

  const StarRating = ({ rating = 0, onRate }: { rating?: number; onRate?: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={(e) => {
            e.stopPropagation()
            onRate?.(star)
          }}
          className="text-accent-gold hover:text-accent-gold-hover transition-colors"
        >
          <Star
            className={`w-3 h-3 ${star <= rating ? 'fill-current' : '&apos;}`}
          />
        </button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="aspect-[3/4] bg-surface-glass animate-pulse" />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <Card variant="glass" padding="lg" className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-surface rounded-full mx-auto flex items-center justify-center">
            <Camera className="w-8 h-8 text-accent-gold" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">Sem imagens ainda</h3>
          <p className=&ldquo;text-foreground-muted&rdquo;>
            Gere retratos com IA ou faça upload para começar a preencher sua galeria.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div
        className={`grid gap-4 ${
          variant === 'grid'
            ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3&apos;
        }`}
      >
        <AnimatePresence>
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              {/* Selection checkbox */}
              {selectable && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image.id)}
                    onChange={() => toggleSelection(image.id)}
                    className="w-4 h-4 rounded border-border-glass bg-surface-glass"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <Card
                variant=&ldquo;glass&rdquo;
                className={`overflow-hidden transition-all duration-200 ${
                  selectable && selectedImages.has(image.id)
                    ? 'ring-2 ring-accent-gold'
                    : 'hover:scale-[1.02]&apos;
                }`}
                onClick={() => handleImageClick(image)}
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={image.url}
                    alt={image.filename || 'Generated image'}
                    className="w-full h-full object-cover"
                    loading=&ldquo;lazy&rdquo;
                  />

                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
                    hoveredImage === image.id ? 'opacity-100' : 'opacity-0&apos;
                  }`}>
                    {/* Top Actions */}
                    {showActions && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className=&ldquo;w-8 h-8 p-0 bg-surface/80 backdrop-blur-sm&rdquo;
                          onClick={(e) => handleFavorite(e, image.id, image.is_favorite)}
                        >
                          <Heart className={`w-4 h-4 ${
                            image.is_favorite ? 'fill-accent-gold text-accent-gold' : 'text-foreground&apos;
                          }`} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 bg-surface/80 backdrop-blur-sm"
                          onClick={(e) => handleDownload(e, image.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        {onExport && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 bg-surface/80 backdrop-blur-sm"
                            onClick={(e) => handleExport(e, image)}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 bg-surface/80 backdrop-blur-sm hover:bg-error/20"
                            onClick={(e) => handleDelete(e, image.id)}
                          >
                            <Trash className="w-4 h-4 text-error" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Center Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-surface/80 backdrop-blur-sm rounded-full p-3">
                        <ZoomIn className="w-6 h-6 text-foreground" />
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-white">
                        {image.metadata?.model && (
                          <p className="text-xs opacity-80 mb-1">
                            {image.metadata.model.toUpperCase()}
                          </p>
                        )}
                        <p className="text-xs">
                          {new Date(image.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {onRate && (
                          <div className="mt-2">
                            <StarRating
                              rating={image.rating}
                              onRate={(rating) => onRate(image.id, rating)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        onFavorite={onFavorite}
        onDownload={onDownload}
        onDelete={onDelete}
        onRate={onRate}
        onExport={onExport}
      />
    </div>
  )
}
