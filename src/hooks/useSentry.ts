"use client"

import * as Sentry from '@sentry/nextjs'

export function useSentry() {
  // Exception capturing with context
  const captureException = (error: Error, context?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setContext('additional_info', context)
        }
        Sentry.captureException(error)
      })
    }
  }

  // Message capturing with levels
  const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    if (typeof window !== 'undefined') {
      Sentry.captureMessage(message, level)
    }
  }

  // User identification
  const setUser = (user: { id: string; email?: string; username?: string }) => {
    if (typeof window !== 'undefined') {
      Sentry.setUser(user)
    }
  }

  // Performance tracing with spans
  const startSpan = (options: { op: string; name: string }, callback: (span: any) => void | Promise<void>) => {
    if (typeof window !== 'undefined') {
      return Sentry.startSpan(options, callback)
    }
  }

  // UI interaction tracing
  const traceUIAction = (actionName: string, callback: () => void | Promise<void>, attributes?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      return Sentry.startSpan(
        {
          op: 'ui.action',
          name: actionName,
        },
        (span) => {
          if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
              span.setAttribute(key, value)
            })
          }
          return callback()
        }
      )
    } else {
      return callback()
    }
  }

  // API call tracing
  const traceAPICall = (method: string, url: string, callback: () => Promise<any>, attributes?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      return Sentry.startSpan(
        {
          op: 'http.client',
          name: `${method.toUpperCase()} ${url}`,
        },
        async (span) => {
          if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
              span.setAttribute(key, value)
            })
          }
          try {
            const result = await callback()
            span.setAttribute('http.status_code', result?.status || 200)
            return result
          } catch (error) {
            span.setAttribute('http.status_code', error?.status || 500)
            throw error
          }
        }
      )
    } else {
      return callback()
    }
  }

  // Logging with structured data
  const logger = typeof window !== 'undefined' && Sentry.logger ? {
    trace: (message: string, extra?: Record<string, any>) => Sentry.logger.trace(message, extra),
    debug: (message: string, extra?: Record<string, any>) => Sentry.logger.debug(message, extra),
    info: (message: string, extra?: Record<string, any>) => Sentry.logger.info(message, extra),
    warn: (message: string, extra?: Record<string, any>) => Sentry.logger.warn(message, extra),
    error: (message: string, extra?: Record<string, any>) => Sentry.logger.error(message, extra),
    fatal: (message: string, extra?: Record<string, any>) => Sentry.logger.fatal(message, extra),
  } : null

  // Tags and context
  const setTag = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      Sentry.setTag(key, value)
    }
  }

  const setContext = (name: string, context: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      Sentry.setContext(name, context)
    }
  }

  // Breadcrumbs
  const addBreadcrumb = (breadcrumb: {
    message: string
    category?: string
    level?: 'info' | 'warning' | 'error'
    data?: Record<string, any>
  }) => {
    if (typeof window !== 'undefined') {
      Sentry.addBreadcrumb(breadcrumb)
    }
  }

  return {
    // Exception handling
    captureException,
    captureMessage,
    
    // User context
    setUser,
    
    // Performance tracing
    startSpan,
    traceUIAction,
    traceAPICall,
    
    // Logging
    logger,
    
    // Context and tags
    setTag,
    setContext,
    addBreadcrumb,
    
    // Direct Sentry access
    Sentry: typeof window !== 'undefined' ? Sentry : null
  }
}

