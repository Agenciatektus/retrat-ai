"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useFileUpload } from '@/hooks/useFileUpload'

interface FileWithPreview {
  file: File
  preview: string
  id: string
}

interface FileUploadProps {
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  onFilesChange?: (files: File[]) => void
  onUpload?: (files: File[]) => Promise<void>
  className?: string
  disabled?: boolean
  variant?: 'default' | 'compact'
  type?: 'user_photo' | 'reference'
  existingFiles?: Array<{ id: string; url: string; filename?: string }>
  projectId?: string
}

export function FileUpload({
  accept = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesChange,
  onUpload,
  className,
  disabled = false,
  variant = 'default',
  type = 'user_photo',
  existingFiles = [],
  projectId
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // Use the file upload hook if projectId is provided
  const fileUploadHook = projectId && type ? useFileUpload({
    projectId,
    type,
    onSuccess: (assets) => {
      // Clear files after successful upload
      files.forEach(f => URL.revokeObjectURL(f.preview))
      setFiles([])
      onUpload?.(files.map(f => f.file))
    },
    onError: (error) => {
      setErrors([error])
    }
  }) : null

  const uploading = fileUploadHook?.uploading || false

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newErrors: string[] = []

    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          newErrors.push(`${file.name} é muito grande (máx. ${maxSize / 1024 / 1024}MB)`)
        } else if (error.code === 'file-invalid-type&apos;) {
          newErrors.push(`${file.name} não é um tipo de arquivo suportado`)
        } else if (error.code === 'too-many-files&apos;) {
          newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`)
        }
      })
    })

    // Check if adding these files would exceed the limit
    const totalFiles = files.length + existingFiles.length + acceptedFiles.length
    if (totalFiles > maxFiles) {
      newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`)
      setErrors(newErrors)
      return
    }

    // Create file previews
    const filesWithPreview: FileWithPreview[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }))

    const updatedFiles = [...files, ...filesWithPreview]
    setFiles(updatedFiles)
    setErrors(newErrors)

    // Notify parent component
    onFilesChange?.(updatedFiles.map(f => f.file))
  }, [files, existingFiles, maxFiles, maxSize, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - existingFiles.length - files.length,
    maxSize,
    disabled: disabled || uploading,
    multiple: maxFiles > 1
  })

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles.map(f => f.file))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    if (fileUploadHook) {
      // Use the integrated upload hook
      await fileUploadHook.uploadFiles(files.map(f => f.file))
    } else if (onUpload) {
      // Fallback to custom upload function
      try {
        await onUpload(files.map(f => f.file))
        // Clear files after successful upload
        files.forEach(f => URL.revokeObjectURL(f.preview))
        setFiles([])
      } catch (error) {
        console.error('Upload failed:', error)
        setErrors(['Upload failed. Please try again.'])
      }
    }
  }

  const totalFiles = files.length + existingFiles.length
  const canUpload = files.length > 0 && !uploading
  const remainingSlots = maxFiles - totalFiles

  if (variant === 'compact') {
    return (
      <div className={clsx("space-y-4", className)}>
        {/* Existing Files */}
        {existingFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {existingFiles.map((file) => (
              <div key={file.id} className="aspect-square bg-surface rounded-lg overflow-hidden">
                <img
                  src={file.url}
                  alt={file.filename || 'Uploaded file'}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* New Files */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {files.map((fileWithPreview) => (
              <motion.div
                key={fileWithPreview.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square bg-surface rounded-lg overflow-hidden"
              >
                <img
                  src={fileWithPreview.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileWithPreview.id)}
                  className="absolute top-2 right-2 w-6 h-6 p-0 bg-surface/80 backdrop-blur-sm hover:bg-error/10"
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add More Button */}
        {remainingSlots > 0 && (
          <div
            {...getRootProps()}
            className={clsx(
              "aspect-square bg-surface-glass border-2 border-dashed border-border-glass rounded-lg flex items-center justify-center cursor-pointer transition-colors",
              isDragActive && "border-accent-gold bg-accent-gold/5",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="w-6 h-6 text-foreground-muted mx-auto mb-2" />
              <p className="text-xs text-foreground-muted">
                {isDragActive ? 'Solte aqui' : 'Adicionar'}
              </p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {canUpload && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpload}
            disabled={!canUpload}
            leftIcon={uploading ? undefined : <Upload className="w-4 h-4" />}
            className=&ldquo;w-full&rdquo;
          >
            {uploading ? 'Enviando...&apos; : `Enviar ${files.length} arquivo${files.length > 1 ? 's' : ''}`}
          </Button>
        )}

        {/* Errors */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              {errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-error text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={clsx("space-y-6", className)}>
      {/* Drop Zone */}
      {remainingSlots > 0 && (
        <div
          {...getRootProps()}
          className={clsx(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-accent-gold bg-accent-gold/5 scale-105"
              : "border-border-glass bg-surface-glass",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />

          <Upload className="w-12 h-12 text-foreground-muted mx-auto mb-4" />

          <div className="space-y-2">
            <p className=&ldquo;font-medium text-foreground&rdquo;>
              {isDragActive
                ? 'Solte os arquivos aqui&apos;
                : `Arraste e solte ou clique para enviar`
              }
            </p>
            <p className="text-sm text-foreground-muted">
              {type === 'user_photo'
                ? 'JPG, PNG até 10MB • Máximo 5 fotos'
                : 'JPG, PNG até 10MB • Máximo 3 referências'
              }
            </p>
            <p className="text-xs text-foreground-muted">
              {remainingSlots} arquivo{remainingSlots > 1 ? 's' : ''} restante{remainingSlots > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {files.map((fileWithPreview) => (
              <motion.div
                key={fileWithPreview.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square bg-surface rounded-lg overflow-hidden">
                  <img
                    src={fileWithPreview.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileWithPreview.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/80 backdrop-blur-sm hover:bg-error/10"
                >
                  <X className="w-4 h-4" />
                </Button>

                <div className="mt-2">
                  <p className="text-xs text-foreground-muted truncate">
                    {fileWithPreview.file.name}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {(fileWithPreview.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {canUpload && (
        <Button
          variant="primary"
          size="lg"
          onClick={handleUpload}
          disabled={!canUpload}
          leftIcon={uploading ? undefined : <Upload className="w-4 h-4" />}
          className=&ldquo;w-full&rdquo;
        >
          {uploading ? 'Enviando arquivos...&apos; : `Enviar ${files.length} arquivo${files.length > 1 ? 's' : ''}`}
        </Button>
      )}

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}