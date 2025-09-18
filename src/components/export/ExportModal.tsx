"use client"

import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Download, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExportImage {
  id: string
  url: string
  filename?: string | null
  metadata?: Record<string, unknown>
}

interface ExportModalProps {
  image: ExportImage | null
  onClose: () => void
}

interface ExportFormat {
  name: string
  extension: string
  description: string
  width: number
  height: number
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    name: 'Instagram Post',
    extension: 'jpg',
    description: 'Quadrado 1080x1080 • Feed',
    width: 1080,
    height: 1080
  },
  {
    name: 'Instagram Stories',
    extension: 'jpg',
    description: 'Vertical 1080x1920 • Stories/Reels',
    width: 1080,
    height: 1920
  },
  {
    name: 'Instagram Portrait',
    extension: 'jpg',
    description: 'Retrato 1080x1350 • Feed vertical',
    width: 1080,
    height: 1350
  },
  {
    name: 'LinkedIn Profile',
    extension: 'jpg',
    description: 'Quadrado 400x400 • Perfil profissional',
    width: 400,
    height: 400
  },
  {
    name: 'LinkedIn Banner',
    extension: 'jpg',
    description: 'Horizontal 1584x396 • Capa do perfil',
    width: 1584,
    height: 396
  },
  {
    name: 'Twitter/X Profile',
    extension: 'jpg',
    description: 'Quadrado 400x400 • Avatar',
    width: 400,
    height: 400
  },
  {
    name: 'High Resolution',
    extension: 'png',
    description: 'Original 2048x2048 • Sem compressão',
    width: 2048,
    height: 2048
  },
  {
    name: 'Print Quality',
    extension: 'png',
    description: '300 DPI • Para impressão',
    width: 3000,
    height: 3000
  },
  {
    name: 'Web Optimized',
    extension: 'webp',
    description: '1200x1200 • Otimizado para web',
    width: 1200,
    height: 1200
  }
]

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME

export function ExportModal({ image, onClose }: ExportModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  if (!image) return null

  const handleDownload = async (format: ExportFormat) => {
    setDownloading(format.name)

    try {
      const publicId = image.metadata?.cloudinary_public_id || image.metadata?.public_id

      if (!publicId || !CLOUDINARY_CLOUD_NAME) {
        // Fallback to original URL when Cloudinary data is missing
        downloadFile(image.url, `${image.filename || 'image&apos;}.${format.extension}`)
        return
      }

      const transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${format.width},h_${format.height},c_fill,f_${format.extension},q_auto:good/${publicId}`

      downloadFile(
        transformedUrl,
        `retrat-ai-${format.name.toLowerCase().replace(/\s+/g, '-&apos;)}.${format.extension}`
      )
    } catch (error) {
      console.error('Download error:', error)
      downloadFile(image.url, `${image.filename || 'image&apos;}.jpg`)
    } finally {
      setDownloading(null)
    }
  }

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.rel = 'noopener noreferrer'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card variant="glass" padding="none">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-accent-gold" />
                  Exportar Imagem
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="mb-6">
                <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden border border-border">
                  <img
                    src={image.url}
                    alt={image.filename || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm text-foreground-muted mt-2">
                  {image.filename || 'Imagem gerada'}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-foreground mb-4">
                  Escolha o formato de export:
                </h3>

                {EXPORT_FORMATS.map((format) => (
                  <div
                    key={format.name}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent-gold/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{format.name}</p>
                      <p className="text-sm text-foreground-muted">{format.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(format)}
                      disabled={downloading === format.name}
                      leftIcon={downloading === format.name ? undefined : <Download className="w-4 h-4" />}
                    >
                      {downloading === format.name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Baixando...
                        </div>
                      ) : (
                        'Download'
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-foreground-muted text-center">
                  Os downloads Sao otimizados automaticamente para cada plataforma
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
