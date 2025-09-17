import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteImage } from '@/lib/cloudinary'

// DELETE /api/projects/[id]/assets/[assetId] - Delete specific asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assetId: string } }
) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get asset with project verification
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        id,
        metadata,
        projects!inner(id, user_id)
      `)
      .eq('id', params.assetId)
      .eq('project_id', params.id)
      .single()

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Verify user owns the project
    if (asset.projects.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from Cloudinary if public_id exists
    if (asset.metadata?.cloudinary_public_id) {
      try {
        await deleteImage(asset.metadata.cloudinary_public_id)
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', params.assetId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting asset from database:', deleteError)
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/projects/[id]/assets/[assetId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
