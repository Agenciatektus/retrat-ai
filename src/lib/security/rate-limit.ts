import { NextRequest } from 'next/server'

interface RateLimitConfig {
  requests: number
  window: number // in seconds
}

// Rate limit configurations
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // API routes
  '/api/generate': { requests: 5, window: 300 }, // 5 generations per 5 minutes
  '/api/upload': { requests: 20, window: 300 }, // 20 uploads per 5 minutes
  '/api/projects': { requests: 30, window: 60 }, // 30 requests per minute
  '/api/billing': { requests: 10, window: 60 }, // 10 billing requests per minute
  
  // Auth routes
  '/api/auth': { requests: 5, window: 300 }, // 5 auth attempts per 5 minutes
  
  // Default rate limit
  'default': { requests: 60, window: 60 } // 60 requests per minute
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function getRateLimitKey(request: NextRequest, userId?: string): string {
  // Use user ID if available, otherwise use IP
  const identifier = userId || getClientIP(request)
  const pathname = request.nextUrl.pathname
  
  // Find matching rate limit config
  const configKey = Object.keys(RATE_LIMITS).find(key => 
    key !== 'default' && pathname.startsWith(key)
  ) || 'default'
  
  return `${configKey}:${identifier}`
}

export function isRateLimited(request: NextRequest, userId?: string): boolean {
  const key = getRateLimitKey(request, userId)
  const pathname = request.nextUrl.pathname
  
  // Find rate limit config
  const configKey = Object.keys(RATE_LIMITS).find(key => 
    key !== 'default' && pathname.startsWith(key)
  ) || 'default'
  
  const config = RATE_LIMITS[configKey]
  const now = Date.now()
  const windowStart = now - (config.window * 1000)
  
  // Get current rate limit data
  const current = rateLimitStore.get(key)
  
  if (!current || current.resetTime < now) {
    // Reset window
    rateLimitStore.set(key, { count: 1, resetTime: now + (config.window * 1000) })
    return false
  }
  
  if (current.count >= config.requests) {
    return true
  }
  
  // Increment count
  rateLimitStore.set(key, { ...current, count: current.count + 1 })
  return false
}

export function getRateLimitHeaders(request: NextRequest, userId?: string) {
  const key = getRateLimitKey(request, userId)
  const pathname = request.nextUrl.pathname
  
  const configKey = Object.keys(RATE_LIMITS).find(key => 
    key !== 'default' && pathname.startsWith(key)
  ) || 'default'
  
  const config = RATE_LIMITS[configKey]
  const current = rateLimitStore.get(key)
  
  const remaining = current ? Math.max(0, config.requests - current.count) : config.requests
  const resetTime = current ? Math.ceil((current.resetTime - Date.now()) / 1000) : config.window
  
  return {
    'X-RateLimit-Limit': config.requests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
    'X-RateLimit-Window': config.window.toString()
  }
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfIP) {
    return cfIP
  }
  
  // Fallback to connection IP
  return request.ip || 'unknown'
}

// Cleanup old entries (call periodically)
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

// Initialize cleanup interval
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 60000) // Cleanup every minute
}

