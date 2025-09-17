"use client"

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button, Card, CardContent } from '@/components/ui'
import { Upload, X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { validateImageFiles, formatFileSize, type ImageValidationError } from '@/lib/utils/image-validation'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadFile extends File {
  id: string
  preview: string
}

interface UploadDropzoneProps {
  projectId: string
  type: 'user_photo' | 'reference'
  onUploadComplete?: (assets: any[]) => void
  maxFiles?: number
  title?: string
  description?: string
}

export function UploadDropzone({
  projectId,
  type,
  onUploadComplete,
  maxFiles = type === 'reference' ? 1 : 5,
  title,
  description,
}: UploadDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<ImageValidationError[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileIdCounter = useRef(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate files
    const validationErrors = validateImageFiles(acceptedFiles)
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      // Create preview files
      const newFiles = acceptedFiles.map((file, index) => ({
        ...file,
        id: `file-${fileIdCounter.current++}-${index}`,
        preview: URL.createObjectURL(file),
      }))

      setFiles(prev => {
        // For reference type, replace existing file
        if (type === 'reference') {
          // Revoke previous preview URLs
          prev.forEach(f => URL.revokeObjectURL(f.preview))
          return newFiles.slice(0, 1) // Only keep first file for reference
        }
        
        // For user photos, add to existing (up to maxFiles)
        const combined = [...prev, ...newFiles]
        return combined.slice(0, maxFiles)
      })
    }
  }, [type, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles,
    multiple: type !== 'reference',
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Revoke URL for removed file
      const removed = prev.find(f => f.id === fileId)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }

  const handleUpload = async () => {
    if (!files.length) return

    setUploading(true)
    setErrors([])

    try {
      const formData = new FormData()
      formData.append('type', type)
      
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/projects/${projectId}/assets`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        // Clear files and revoke URLs
        files.forEach(file => URL.revokeObjectURL(file.preview))
        setFiles([])
        
        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete(result.uploaded)
        }
      } else {
        setErrors(result.errors || [{ 
          code: 'UPLOAD_FAILED', 
          message: result.error || 'Upload failed' 
        }])
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors([{
        code: 'UPLOAD_FAILED',
        message: 'Network error during upload',
      }])
    } finally {
      setUploading(false)
    }
  }

  const getDropzoneText = () => {
    if (type === 'reference') {
      return {
        title: title || 'Imagem de Referência',
        description: description || 'Envie uma imagem que defina o estilo desejado',
        dragText: 'Solte a imagem de referência aqui',
        clickText: 'ou clique para selecionar',
      }
    }
    
    return {
      title: title || 'Suas Fotos',
      description: description || 'Envie de 1 a 5 fotos suas para gerar retratos',
      dragText: 'Solte suas fotos aqui',
      clickText: 'ou clique para selecionar',
    }
  }

  const text = getDropzoneText()

  return (
    <Card variant="glass" padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
            {text.title}
          </h3>
          <p className="text-foreground-muted text-sm">
            {text.description}
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-accent-gold bg-accent-gold-muted' 
              : 'border-border hover:border-accent-gold'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isDragActive ? 'text-accent-gold' : 'text-foreground-muted'
          }`} />
          <p className="text-foreground mb-2">
            {isDragActive ? text.dragText : text.dragText}
          </p>
          <p className="text-foreground-muted text-sm">
            {text.clickText}
          </p>
          <p className="text-xs text-foreground-subtle mt-2">
            JPEG, PNG, WebP • Máximo 10MB por arquivo
          </p>
        </div>

        {/* File Previews */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-foreground">
                Arquivos Selecionados ({files.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden border border-border">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* File info */}
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={uploading}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>

                    {/* Upload progress */}
                    {uploading && uploadProgress[file.id] && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs">
                          {uploadProgress[file.id]}%
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-error/10 border border-error rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <p className="text-sm text-error">
                  {error.file ? `${error.file}: ` : ''}{error.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading}
              leftIcon={uploading ? undefined : <Upload className="w-4 h-4" />}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                `Enviar ${files.length} ${files.length === 1 ? 'arquivo' : 'arquivos'}`
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
