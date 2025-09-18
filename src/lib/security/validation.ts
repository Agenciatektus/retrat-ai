import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// =====================================================
// INPUT VALIDATION SCHEMAS
// =====================================================

// User input validation
export const UserInputSchema = z.object({
  full_name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string().email('Email inválido').max(255, 'Email muito longo'),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal(''))
})

// Project input validation
export const ProjectInputSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_]+$/, 'Nome contém caracteres inválidos'),
  description: z.string()
    .max(500, 'Descrição muito longa')
    .optional()
    .or(z.literal(''))
})

// Asset input validation
export const AssetInputSchema = z.object({
  project_id: z.string().uuid('ID do projeto inválido'),
  type: z.enum(['user_photo', 'reference', 'generated'], {
    errorMap: () => ({ message: 'Tipo de asset inválido' })
  }),
  filename: z.string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo muito longo')
    .regex(/^[a-zA-Z0-9\-_\.]+$/, 'Nome do arquivo contém caracteres inválidos'),
  alt_text: z.string().max(200, 'Texto alternativo muito longo').optional()
})

// Generation input validation
export const GenerationInputSchema = z.object({
  project_id: z.string().uuid('ID do projeto inválido'),
  prompt: z.string()
    .min(10, 'Prompt muito curto')
    .max(1000, 'Prompt muito longo'),
  style_reference: z.string().url('URL de referência inválida').optional(),
  settings: z.object({
    quality: z.enum(['standard', 'high', 'ultra']).default('standard'),
    aspect_ratio: z.enum(['1:1', '3:4', '4:3', '16:9']).default('3:4'),
    style_strength: z.number().min(0.1).max(1.0).default(0.7)
  }).optional()
})

// =====================================================
// SANITIZATION FUNCTIONS
// =====================================================

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHTML(content: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
  
  // Client-side: use DOMPurify
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 1000) // Limit length
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 100) // Limit length
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate email format (more strict than basic regex)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate URL format and allowed domains
 */
export function isValidURL(url: string, allowedDomains?: string[]): boolean {
  try {
    const urlObj = new URL(url)
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
      return false
    }
    
    // Check allowed domains if specified
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.includes(urlObj.hostname)
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Rate limit validation for user actions
 */
export function validateActionFrequency(
  lastAction: Date | null,
  minIntervalSeconds: number
): { valid: boolean; waitTime?: number } {
  if (!lastAction) {
    return { valid: true }
  }
  
  const now = new Date()
  const timeSinceLastAction = (now.getTime() - lastAction.getTime()) / 1000
  
  if (timeSinceLastAction < minIntervalSeconds) {
    const waitTime = Math.ceil(minIntervalSeconds - timeSinceLastAction)
    return { valid: false, waitTime }
  }
  
  return { valid: true }
}

