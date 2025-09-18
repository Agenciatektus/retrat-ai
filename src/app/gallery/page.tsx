"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGallery } from '@/hooks/useGallery'
import { AppHeader } from '@/components/layout'
import { 
  ImageGallery, 
  BatchOperations, 
  ImageComparison,
  type GalleryImage 
} from '@/components/gallery'
import { ExportModal } from '@/components/export/ExportModal'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Grid, 
  List, 
  Filter, 
  Search, 
  SortAsc, 
  Heart, 
  Star,
  GitCompare,
  Download,
  Trash,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ViewMode = 'grid' | 'list'
type SortBy = 'newest' | 'oldest' | 'rating' | 'favorites'
type FilterBy = 'all' | 'favorites' | 'generated' | 'uploaded'

export default function GalleryPage() {
  const { user, loading: authLoading } = useAuth()
  const {
    downloadImage,
    downloadMultiple,
    favoriteImage,
    rateImage,
    deleteImage,
    deleteMultiple,
    loading: galleryLoading,
    error
  } = useGallery()

  // Gallery state
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [exportImage, setExportImage] = useState<GalleryImage | null>(null)

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      if (!user || authLoading) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/assets?type=generated')
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to load images')
        }

        const data = await response.json()
        setImages(data.assets || [])
      } catch (err) {
        console.error('Error loading images:', err)
        setImages([]) // Set empty array on error to stop loading
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadImages()
    }
  }, [user, authLoading, router])

  // Filter and sort images
  useEffect(() => {
    let filtered = [...images]

    // Apply filters
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(img => img.is_favorite)
        break
      case 'generated':
        filtered = filtered.filter(img => img.type === 'generated')
        break
      case 'uploaded':
        filtered = filtered.filter(img => img.type === 'user_photo')
        break
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.metadata?.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'favorites':
        filtered.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
        break
    }

    setFilteredImages(filtered)
  }, [images, filterBy, searchQuery, sortBy])

  // Gallery actions
  const handleFavorite = async (imageId: string, isFavorite: boolean) => {
    const success = await favoriteImage(imageId, isFavorite)
    if (success) {
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, is_favorite: isFavorite } : img
      ))
    }
  }

  const handleRate = async (imageId: string, rating: number) => {
    const success = await rateImage(imageId, rating)
    if (success) {
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, rating } : img
      ))
    }
  }

  const handleDownload = async (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    await downloadImage(imageId, image?.filename || undefined)
  }

  const handleDelete = async (imageId: string) => {
    const success = await deleteImage(imageId)
    if (success) {
      setImages(prev => prev.filter(img => img.id !== imageId))
      setSelectedImages(prev => prev.filter(id => id !== imageId))
    }
  }

  const handleExport = (image: GalleryImage) => {
    setExportImage(image)
  }

  // Batch operations
  const handleBatchSelect = (selectedIds: string[]) => {
    setSelectedImages(selectedIds)
  }

  const handleSelectAll = () => {
    setSelectedImages(filteredImages.map(img => img.id))
  }

  const handleDeselectAll = () => {
    setSelectedImages([])
    setIsSelectionMode(false)
  }

  const handleBatchDownload = async () => {
    await downloadMultiple(selectedImages)
  }

  const handleBatchDelete = async () => {
    const success = await deleteMultiple(selectedImages)
    if (success) {
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)))
      setSelectedImages([])
      setIsSelectionMode(false)
    }
  }

  const handleBatchFavorite = async (isFavorite: boolean) => {
    // Process in batches to avoid overwhelming the API
    for (const imageId of selectedImages) {
      await favoriteImage(imageId, isFavorite)
    }
    
    // Update local state
    setImages(prev => prev.map(img => 
      selectedImages.includes(img.id) ? { ...img, is_favorite: isFavorite } : img
    ))
  }

  // Comparison mode
  const handleCompareSelected = () => {
    if (selectedImages.length >= 2) {
      setShowComparison(true)
    }
  }

  const comparisonImages = selectedImages
    .slice(0, 2)
    .map(id => images.find(img => img.id === id))
    .filter(Boolean) as GalleryImage[]

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground-muted">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card variant="glass" padding="lg" className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Acesso Restrito
          </h2>
          <p className="text-foreground-muted mb-6">
            Você precisa estar logado para acessar a galeria.
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>
            Fazer Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader subtitle="Galeria de Retratos" />
      
      <div className="bg-gradient-to-b from-surface-glass to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                Galeria de Retratos
              </h1>
              <p className="text-foreground-muted">
                {filteredImages.length} {filteredImages.length === 1 ? 'imagem' : 'imagens'} 
                {filterBy !== 'all' && ` • ${filterBy}`}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Buscar imagens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-accent-gold"
                />
              </div>

              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent-gold"
              >
                <option value="all">Todas</option>
                <option value="favorites">Favoritas</option>
                <option value="generated">Geradas</option>
                <option value="uploaded">Enviadas</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent-gold"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="rating">Melhor avaliadas</option>
                <option value="favorites">Favoritas primeiro</option>
              </select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Selection Mode */}
              <Button
                variant={isSelectionMode ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode)
                  if (isSelectionMode) {
                    setSelectedImages([])
                  }
                }}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                {isSelectionMode ? 'Sair da Seleção' : 'Selecionar'}
              </Button>

              {/* Compare Button */}
              {selectedImages.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  leftIcon={<GitCompare className="w-4 h-4" />}
                  className="border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-black"
                >
                  Comparar ({selectedImages.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        {/* Error Message */}
        {error && (
          <Card variant="glass" padding="md" className="mb-6 border-error/20 bg-error/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-error" />
              <div>
                <h3 className="font-semibold text-error">Erro</h3>
                <p className="text-error/80 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Comparison View */}
        <AnimatePresence>
          {showComparison && comparisonImages.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8"
            >
              <ImageComparison
                images={comparisonImages}
                onClose={() => setShowComparison(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State for Images */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground-muted">Carregando imagens...</p>
          </div>
        )}

        {/* Gallery */}
        {!loading && (
          <ImageGallery
            images={filteredImages}
            loading={galleryLoading}
            variant={viewMode === 'grid' ? 'grid' : 'masonry'}
            selectable={isSelectionMode}
            onFavorite={handleFavorite}
            onRate={handleRate}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onExport={handleExport}
            onBatchSelect={handleBatchSelect}
          />
        )}

        {/* Batch Operations */}
        {isSelectionMode && (
          <BatchOperations
            selectedImages={selectedImages}
            totalImages={filteredImages.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onDownloadSelected={handleBatchDownload}
            onDeleteSelected={handleBatchDelete}
            onFavoriteSelected={handleBatchFavorite}
            loading={galleryLoading}
          />
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        image={exportImage}
        onClose={() => setExportImage(null)}
      />
    </div>
  )
}

