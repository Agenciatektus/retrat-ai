// =====================================================
// CACHING STRATEGY FOR PERFORMANCE
// =====================================================

export interface CacheConfig {
  ttl: number // Time to live in seconds
  staleWhileRevalidate?: number // SWR time in seconds
  tags?: string[] // Cache tags for invalidation
}

// Cache configurations for different data types
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // User data - short cache, frequent updates
  user_profile: { ttl: 300, staleWhileRevalidate: 60, tags: ['user'] }, // 5min
  user_projects: { ttl: 600, staleWhileRevalidate: 120, tags: ['user', 'projects'] }, // 10min
  
  // Static content - long cache
  pricing_plans: { ttl: 3600, staleWhileRevalidate: 1800, tags: ['pricing'] }, // 1hr
  app_config: { ttl: 1800, staleWhileRevalidate: 900, tags: ['config'] }, // 30min
  
  // Generated content - medium cache
  user_assets: { ttl: 900, staleWhileRevalidate: 300, tags: ['user', 'assets'] }, // 15min
  generations: { ttl: 1800, staleWhileRevalidate: 600, tags: ['user', 'generations'] }, // 30min
  
  // Analytics - very short cache
  usage_stats: { ttl: 60, staleWhileRevalidate: 30, tags: ['user', 'usage'] }, // 1min
  admin_stats: { ttl: 300, staleWhileRevalidate: 120, tags: ['admin'] }, // 5min
}

/**
 * In-memory cache for development/small deployments
 * In production, this should be replaced with Redis
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number; stale: number }>()

  set(key: string, data: any, config: CacheConfig): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      expires: now + (config.ttl * 1000),
      stale: now + ((config.staleWhileRevalidate || 0) * 1000)
    })
  }

  get(key: string): { data: any; isStale: boolean } | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    
    // Check if expired
    if (now > item.expires) {
      this.cache.delete(key)
      return null
    }

    // Check if stale
    const isStale = now > item.stale
    return { data: item.data, isStale }
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
const cache = new MemoryCache()

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

/**
 * Get data from cache or fetch if not available
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  configKey: keyof typeof CACHE_CONFIGS
): Promise<T> {
  const config = CACHE_CONFIGS[configKey]
  const cached = cache.get(key)

  if (cached && !cached.isStale) {
    return cached.data
  }

  // Fetch fresh data
  try {
    const data = await fetcher()
    cache.set(key, data, config)
    return data
  } catch (error) {
    // If fetch fails and we have stale data, return it
    if (cached) {
      return cached.data
    }
    throw error
  }
}

/**
 * Invalidate cache by key or tags
 */
export function invalidateCache(keyOrPattern: string): void {
  if (keyOrPattern.includes('*')) {
    // Pattern matching
    const pattern = keyOrPattern.replace('*', '.*')
    const regex = new RegExp(pattern)
    
    for (const key of cache['cache'].keys()) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  } else {
    // Exact key
    cache.delete(keyOrPattern)
  }
}

/**
 * Cache headers for API responses
 */
export function getCacheHeaders(configKey: keyof typeof CACHE_CONFIGS): Record<string, string> {
  const config = CACHE_CONFIGS[configKey]
  
  return {
    'Cache-Control': `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate || config.ttl}`,
    'CDN-Cache-Control': `public, max-age=${config.ttl}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${config.ttl}`,
  }
}

/**
 * React hook for cached data fetching
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  configKey: keyof typeof CACHE_CONFIGS,
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getCachedData(key, fetcher, configKey)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [key, ...dependencies])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

