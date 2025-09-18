"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Trash, 
  Heart, 
  X, 
  CheckSquare, 
  Square,
  Package,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BatchOperationsProps {
  selectedImages: string[]
  totalImages: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onDownloadSelected: () => void
  onDeleteSelected: () => void
  onFavoriteSelected: (isFavorite: boolean) => void
  loading?: boolean
  className?: string
}

export function BatchOperations({
  selectedImages,
  totalImages,
  onSelectAll,
  onDeselectAll,
  onDownloadSelected,
  onDeleteSelected,
  onFavoriteSelected,
  loading = false,
  className
}: BatchOperationsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const hasSelection = selectedImages.length > 0
  const isAllSelected = selectedImages.length === totalImages && totalImages > 0

  const handleDeleteConfirm = () => {
    onDeleteSelected()
    setShowDeleteConfirm(false)
  }

  if (!hasSelection) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 ${className}`}
      >
        <Card variant="elevated" className="backdrop-blur-md border-accent-gold/20">
          <CardContent className="px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Selection Info */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent-gold" />
                  <span className="font-medium text-foreground">
                    {selectedImages.length} {selectedImages.length === 1 ? 'imagem' : 'imagens'} selecionada{selectedImages.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Select All/None */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isAllSelected ? onDeselectAll : onSelectAll}
                    className="text-accent-gold hover:text-accent-gold-hover"
                  >
                    {isAllSelected ? (
                      <>
                        <CheckSquare className="w-4 h-4 mr-1" />
                        Desmarcar todas
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 mr-1" />
                        Selecionar todas ({totalImages})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-border"></div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Download */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadSelected}
                  disabled={loading}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="hover:border-accent-gold hover:text-accent-gold"
                >
                  {loading ? 'Preparando...' : 'Download'}
                </Button>

                {/* Favorite */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFavoriteSelected(true)}
                  disabled={loading}
                  leftIcon={<Heart className="w-4 h-4" />}
                  className="hover:border-accent-gold hover:text-accent-gold"
                >
                  Favoritar
                </Button>

                {/* Delete */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  leftIcon={<Trash className="w-4 h-4" />}
                  className="hover:border-error hover:text-error"
                >
                  Deletar
                </Button>

                {/* Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeselectAll}
                  className="text-foreground-muted hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <Card variant="elevated">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-error" />
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2">
                      Deletar {selectedImages.length} {selectedImages.length === 1 ? 'imagem' : 'imagens'}?
                    </h3>
                    
                    <p className="text-foreground-muted mb-6">
                      Esta ação não pode ser desfeita. As imagens serão removidas permanentemente.
                    </p>

                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleDeleteConfirm}
                        disabled={loading}
                        className="bg-error hover:bg-error/90"
                      >
                        {loading ? 'Deletando...' : 'Deletar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
