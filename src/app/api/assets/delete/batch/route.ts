
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
﻿import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'

export const runtime = 'nodejs'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const BatchDeleteSchema = z.object({
  imageIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos uma imagem').max(20, 'Limite de 20 imagens por operação')
})

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { imageIds } = BatchDeleteSchema.parse(payload)

    const supabase = createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, public_id')
      .in('id', imageIds)
      .eq('user_id', user.id)

    if (assetsError) {
      console.error('Error fetching assets for batch delete:', assetsError)
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json({ error: 'No assets found for deletion' }, { status: 404 })
    }

    const missingIds = imageIds.filter(
      (id) => !assets.some((asset) => asset.id === id)
    )

    if (missingIds.length > 0) {
      return NextResponse.json({
        error: 'Some assets were not found for this user',
        missingIds
      }, { status: 404 })
    }

    const publicIds = assets
      .map((asset) => asset.public_id)
      .filter((publicId): publicId is string => Boolean(publicId))

    if (publicIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIds)
      } catch (cloudinaryError) {
        console.error('Error deleting Cloudinary resources:', cloudinaryError)
        // Continue with database deletion to avoid leaving dangling records
      }
    }

    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .in('id', imageIds)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting assets from database:', deleteError)
      return NextResponse.json({ error: 'Failed to delete assets' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deleted: assets.length
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in POST /api/assets/delete/batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
