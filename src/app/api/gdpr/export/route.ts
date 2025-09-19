import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportUserData } from '@/lib/security/gdpr'
import * as Sentry from '@sentry/nextjs'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// POST /api/gdpr/export - Export user data for GDPR compliance
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/gdpr/export',
    },
    async (span) => {
      try {
        const supabase = createClient()

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          span.setAttribute('http.status_code', 401)
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        span.setAttribute('user.id', user.id)
        span.setAttribute('operation', 'gdpr_export')

        // Log the export request
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'GDPR_EXPORT_REQUEST',
            resource_type: 'user',
            resource_id: user.id,
            details: {
              requested_at: new Date().toISOString(),
              ip_address: request.headers.get('x-forwarded-for') || 'unknown'
            }
          })

        // Export user data
        const userData = await exportUserData(user.id)

        span.setAttribute('http.status_code', 200)
        span.setAttribute('exported_records', Object.values(userData).flat().length)

        Sentry.logger.info('GDPR data export completed', {
          userId: user.id,
          recordCount: Object.values(userData).flat().length
        })

        return NextResponse.json({
          message: 'Data export completed',
          data: userData,
          exported_at: new Date().toISOString()
        })

      } catch (error) {
        span.setAttribute('http.status_code', 500)
        Sentry.logger.error('Error in GDPR data export', { error })
        Sentry.captureException(error as Error)
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
      }
    }
  )
}



