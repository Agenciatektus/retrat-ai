import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const FavoriteRequestSchema = z.object({
  is_favorite: z.boolean()
})

// PATCH /api/assets/[id]/favorite - Toggle favorite status
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
    const { is_favorite } = FavoriteRequestSchema.parse(body)

    // Update asset metadata
    const { data: asset, error } = await supabase
      .from('assets')
      .update({
        metadata: supabase.rpc('jsonb_set', {
          target: 'metadata',
          path: ['is_favorite'],
          new_value: JSON.stringify(is_favorite)
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
      console.error('Error updating favorite status:', error)
      return NextResponse.json({ error: 'Failed to update favorite status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      asset,
      is_favorite
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in PATCH /api/assets/[id]/favorite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}