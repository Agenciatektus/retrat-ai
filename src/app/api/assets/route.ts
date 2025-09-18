import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/assets - Get user's assets with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'generated', 'user_photo', 'reference'
    const projectId = searchParams.get('project_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: assets, error, count } = await query

    if (error) {
      console.error('Error fetching assets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assets' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      assets: assets || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    })

  } catch (error) {
    console.error('Error in GET /api/assets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
