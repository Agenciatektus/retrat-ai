import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteUserData } from '@/lib/security/gdpr'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

import * as Sentry from '@sentry/nextjs'

// DELETE /api/gdpr/delete - Delete user data for GDPR compliance
export async function DELETE(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'DELETE /api/gdpr/delete',
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
        span.setAttribute('operation', 'gdpr_delete')

        // Parse request body for confirmation
        const body = await request.json()
        const { confirmation } = body

        if (confirmation !== 'DELETE_MY_DATA') {
          span.setAttribute('http.status_code', 400)
          return NextResponse.json({ 
            error: 'Confirmation required. Send { "confirmation": "DELETE_MY_DATA" }' 
          }, { status: 400 })
        }

        // Log the deletion request
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'GDPR_DELETE_REQUEST',
            resource_type: 'user',
            resource_id: user.id,
            details: {
              requested_at: new Date().toISOString(),
              ip_address: request.headers.get('x-forwarded-for') || 'unknown',
              confirmation: confirmation
            }
          })

        // Delete user data
        const success = await deleteUserData(user.id)

        if (!success) {
          span.setAttribute('http.status_code', 500)
          return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
        }

        span.setAttribute('http.status_code', 200)

        Sentry.logger.info('GDPR data deletion completed', {
          userId: user.id
        })

        return NextResponse.json({
          message: 'All user data has been permanently deleted',
          deleted_at: new Date().toISOString()
        })

      } catch (error) {
        span.setAttribute('http.status_code', 500)
        Sentry.logger.error('Error in GDPR data deletion', { error })
        Sentry.captureException(error as Error)
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
      }
    }
  )
}

