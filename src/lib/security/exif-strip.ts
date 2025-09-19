import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface ExifStrippedResult {
  url: string
  publicId: string
  secureUrl: string
  format: string
  width: number
  height: number
  bytes: number
}

/**
 * Upload image to Cloudinary with EXIF metadata stripping
 * This ensures no sensitive metadata (location, camera info, etc.) is preserved
 */
export async function uploadImageWithExifStripping(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<ExifStrippedResult> {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${folder}/${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
          resource_type: 'image',
          // Security transformations
          transformation: [
            {
              // Strip all EXIF metadata
              flags: 'strip_profile',
              // Ensure safe format
              fetch_format: 'auto',
              quality: 'auto:good',
              // Limit size for security
              width: 2048,
              height: 2048,
              crop: 'limit'
            }
          ],
          // Additional security options
          invalidate: true,
          use_filename: false,
          unique_filename: true,
          overwrite: false,
          // Content moderation (if available)
          moderation: 'aws_rek',
          notification_url: process.env.CLOUDINARY_WEBHOOK_URL
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new Error(`Upload failed: ${error.message}`))
            return
          }

          if (!result) {
            reject(new Error('Upload failed: No result from Cloudinary'))
            return
          }

          resolve({
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
          })
        }
      ).end(fileBuffer)
    })
  } catch (error) {
    console.error('Error in uploadImageWithExifStripping:', error)
    throw new Error('Failed to upload and process image')
  }
}

/**
 * Validate image file for security
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' }
  }

  // Basic filename validation (prevent path traversal)
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, error: 'Invalid filename' }
  }

  return { valid: true }
}

/**
 * Generate secure signed URL for private assets
 */
export function generateSecureUrl(publicId: string, expiresIn: number = 3600): string {
  try {
    return cloudinary.url(publicId, {
      type: 'authenticated',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
      transformation: [
        {
          flags: 'strip_profile', // Ensure EXIF is still stripped on delivery
          quality: 'auto:good'
        }
      ]
    })
  } catch (error) {
    console.error('Error generating secure URL:', error)
    throw new Error('Failed to generate secure URL')
  }
}

/**
 * Delete image from Cloudinary (GDPR compliance)
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}



