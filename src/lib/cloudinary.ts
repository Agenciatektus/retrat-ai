import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  bytes: number
  format: string
  created_at: string
}

export async function uploadImage(
  buffer: Buffer,
  options: {
    folder?: string
    public_id?: string
    transformation?: Record<string, unknown>
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
  } = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'retratai/uploads',
      resource_type: options.resource_type || 'image',
      public_id: options.public_id,
      transformation: options.transformation || {
        quality: 'auto:good',
        fetch_format: 'auto',
      },
      // Strip EXIF data for privacy
      strip_exif: true,
      // Optimize images
      flags: 'progressive',
      ...options,
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
            created_at: result.created_at,
          })
        } else {
          reject(new Error('Upload failed: No result returned'))
        }
      }
    ).end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    throw error
  }
}

export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
    format?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    quality: options.quality || 'auto:good',
    fetch_format: options.format || 'auto',
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    secure: true,
  })
}

export default cloudinary

