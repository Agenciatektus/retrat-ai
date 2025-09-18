import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'

// GET /api/assets/[id]/download - Download asset
export async function GET(
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

    // Get asset
    const { data: asset, error } = await supabase
      .from('assets')
      .select('url, filename, mime_type')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    try {
      // Fetch the image from Cloudinary/external URL
      const imageResponse = await fetch(asset.url)

      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image')
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      const filename = asset.filename || `image-${params.id}.jpg`

      // Return the image with proper headers for download
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': asset.mime_type || 'image/jpeg',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': imageBuffer.byteLength.toString(),
        }
      })

    } catch (fetchError) {
      console.error('Error fetching image:', fetchError)
      return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in GET /api/assets/[id]/download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}