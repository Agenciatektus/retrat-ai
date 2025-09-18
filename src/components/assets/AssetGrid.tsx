"use client"

import { useState } from 'react'
import { Button } from '@/components/ui'
import { Download, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import { Asset } from '@/lib/types/projects'
import { formatFileSize } from '@/lib/utils/image-validation'
import { motion, AnimatePresence } from 'framer-motion'

interface AssetGridProps {
  assets: Asset[]
  onDelete?: (assetId: string) => void
  onDownload?: (asset: Asset) => void
  onPreview?: (asset: Asset) => void
  className?: string
}

export function AssetGrid({ 
  assets, 
  onDelete, 
  onDownload, 
  onPreview,
  className = '' 
}: AssetGridProps) {
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [deletingAssets, setDeletingAssets] = useState<Set<string>>(new Set())

  const handleDelete = async (assetId: string) => {
    if (!onDelete) return
    
    setDeletingAssets(prev => new Set(prev).add(assetId))
    await onDelete(assetId)
    setDeletingAssets(prev => {
      const newSet = new Set(prev)
      newSet.delete(assetId)
      return newSet
    })
  }

  const toggleSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(assetId)) {
        newSet.delete(assetId)
      } else {
        newSet.add(assetId)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (!onDelete || selectedAssets.size === 0) return
    
    const confirmMessage = `Tem certeza que deseja excluir ${selectedAssets.size} ${
      selectedAssets.size === 1 ? 'imagem' : 'imagens'
    }?`
    
    if (!confirm(confirmMessage)) return

    for (const assetId of selectedAssets) {
      await handleDelete(assetId)
    }
    
    setSelectedAssets(new Set())
  }

  if (assets.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bulk Actions */}
      {selectedAssets.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-accent-gold-muted rounded-lg border border-accent-gold"
        >
          <p className="text-sm font-medium text-foreground">
            {selectedAssets.size} {selectedAssets.size === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAssets(new Set())}
            >
              Cancelar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              className="text-error hover:text-error"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir
            </Button>
          </div>
        </motion.div>
      )}

      {/* Assets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedAssets.has(asset.id)}
                  onChange={() => toggleSelection(asset.id)}
                  className="w-4 h-4 text-accent-gold bg-background border-border rounded focus:ring-accent-gold focus:ring-2"
                />
              </div>

              {/* Image */}
              <div 
                className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer"
                onClick={() => onPreview?.(asset)}
              >
                <img
                  src={asset.url}
                  alt={asset.filename || 'Asset'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Loading overlay */}
                {deletingAssets.has(asset.id) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                {onPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => onPreview(asset)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                {onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => onDownload(asset)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/20"
                    onClick={() => handleDelete(asset.id)}
                    disabled={deletingAssets.has(asset.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Asset Info */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {asset.filename || 'Sem nome'}
                </p>
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span>{formatFileSize(asset.size || 0)}</span>
                  <span>
                    {asset.metadata?.width && asset.metadata?.height
                      ? `${asset.metadata.width}×${asset.metadata.height}`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

