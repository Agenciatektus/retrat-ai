import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const RatingRequestSchema = z.object({
  rating: z.number().int().min(1).max(5)
})

// PATCH /api/assets/[id]/rate - Rate asset
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const body = await request.json()
    const { rating } = RatingRequestSchema.parse(body)

    // Update asset metadata
    const { data: asset, error } = await supabase
      .from('assets')
      .update({
        metadata: supabase.rpc('jsonb_set', {
          target: 'metadata',
          path: ['rating'],
          new_value: JSON.stringify(rating)
        })
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
      }
      console.error('Error updating rating:', error)
      return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      asset,
      rating
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in PATCH /api/assets/[id]/rate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}