import { createClient } from '@/lib/supabase/server'
import { deleteImage } from './exif-strip'
import * as Sentry from '@sentry/nextjs'

export interface GDPRDataExport {
  user: any
  projects: any[]
  assets: any[]
  generations: any[]
  subscriptions: any[]
  usage: any[]
  audit_logs: any[]
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<GDPRDataExport> {
  const supabase = createClient()
  
  try {
    // Get user profile
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Get user projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)

    // Get user assets
    const { data: assets } = await supabase
      .from('assets')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('projects.user_id', userId)

    // Get user generations
    const { data: generations } = await supabase
      .from('generations')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('projects.user_id', userId)

    // Get user subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)

    // Get user usage
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)

    // Get audit logs (if user is admin)
    const { data: audit_logs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)

    return {
      user: user || {},
      projects: projects || [],
      assets: assets || [],
      generations: generations || [],
      subscriptions: subscriptions || [],
      usage: usage || [],
      audit_logs: audit_logs || []
    }
  } catch (error) {
    Sentry.captureException(error as Error, {
      tags: { operation: 'gdpr_export' },
      extra: { userId }
    })
    throw new Error('Failed to export user data')
  }
}

/**
 * Delete all user data for GDPR compliance (Right to be forgotten)
 */
export async function deleteUserData(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // Start transaction-like operations
    Sentry.addBreadcrumb({
      message: 'Starting GDPR data deletion',
      category: 'gdpr',
      data: { userId }
    })

    // 1. Get all user assets to delete from Cloudinary
    const { data: assets } = await supabase
      .from('assets')
      .select(`
        cloudinary_public_id,
        projects!inner(user_id)
      `)
      .eq('projects.user_id', userId)

    // 2. Delete images from Cloudinary
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        if (asset.cloudinary_public_id) {
          await deleteImage(asset.cloudinary_public_id)
        }
      }
    }

    // 3. Delete user data from database (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      throw deleteError
    }

    // 4. Log the deletion for audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: null, // User no longer exists
        action: 'GDPR_DELETE',
        resource_type: 'user',
        resource_id: userId,
        details: {
          deleted_at: new Date().toISOString(),
          assets_count: assets?.length || 0
        }
      })

    Sentry.addBreadcrumb({
      message: 'GDPR data deletion completed',
      category: 'gdpr',
      data: { userId, assetsDeleted: assets?.length || 0 }
    })

    return true
  } catch (error) {
    Sentry.captureException(error as Error, {
      tags: { operation: 'gdpr_delete' },
      extra: { userId }
    })
    return false
  }
}

/**
 * Anonymize user data (alternative to full deletion)
 */
export async function anonymizeUserData(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // Update user with anonymized data
    const { error } = await supabase
      .from('users')
      .update({
        email: `deleted_${userId}@example.com`,
        full_name: 'Deleted User',
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      throw error
    }

    // Log the anonymization
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'GDPR_ANONYMIZE',
        resource_type: 'user',
        resource_id: userId,
        details: {
          anonymized_at: new Date().toISOString()
        }
      })

    return true
  } catch (error) {
    Sentry.captureException(error as Error, {
      tags: { operation: 'gdpr_anonymize' },
      extra: { userId }
    })
    return false
  }
}

/**
 * Check if user has given consent for data processing
 */
export function validateConsent(consentData: any): boolean {
  const requiredConsents = [
    'data_processing',
    'cookies',
    'analytics',
    'marketing'
  ]
  
  return requiredConsents.every(consent => 
    consentData[consent] === true
  )
}

/**
 * Sanitize user input for safe storage
 */
export function sanitizeInput(input: string, allowHTML: boolean = false): string {
  if (!input) return ''
  
  let sanitized = input.trim()
  
  if (allowHTML) {
    // Allow safe HTML tags
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    })
  } else {
    // Strip all HTML
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
  }
  
  // Remove null bytes and control characters
  sanitized = sanitized
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized
}

/**
 * Validate file upload for security
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // File size limit (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }

  // Allowed MIME types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }
  }

  // Validate file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' }
  }

  // Check for suspicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, error: 'Invalid filename' }
  }

  return { valid: true }
}



