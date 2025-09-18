// Image validation utilities following EP-004 requirements

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB as specified in PLAN-MVP
export const MAX_FILES_PER_PROJECT = 8 // Reasonable limit for user photos

export interface ImageValidationError {
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'TOO_MANY_FILES' | 'INVALID_DIMENSIONS'
  message: string
  file?: string
}

export function validateImageFile(file: File): ImageValidationError | null {
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return {
      code: 'INVALID_TYPE',
      message: `Tipo de arquivo não suportado. Use apenas: ${ALLOWED_MIME_TYPES.join(', &apos;)}`,
      file: file.name,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
    return {
      code: 'FILE_TOO_LARGE',
      message: `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`,
      file: file.name,
    }
  }

  return null
}

export function validateImageFiles(files: File[]): ImageValidationError[] {
  const errors: ImageValidationError[] = []

  // Check total number of files
  if (files.length > MAX_FILES_PER_PROJECT) {
    errors.push({
      code: 'TOO_MANY_FILES&apos;,
      message: `Máximo de ${MAX_FILES_PER_PROJECT} arquivos permitidos`,
    })
    return errors // Return early if too many files
  }

  // Validate each file
  files.forEach(file => {
    const error = validateImageFile(file)
    if (error) {
      errors.push(error)
    }
  })

  return errors
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}
