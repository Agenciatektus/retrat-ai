import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import JSZip from 'jszip'
import { z } from 'zod'
import { Buffer } from 'node:buffer'

export const runtime = 'nodejs'

const BatchDownloadSchema = z.object({
  imageIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos uma imagem').max(20, 'Limite de 20 imagens por download')
})

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif'
}

function getExtension(filename?: string | null, mimeType?: string | null): string {
  if (filename?.includes('.')) {
    return filename.split('.').pop() ?? 'jpg'
  }
  if (mimeType && MIME_EXTENSION_MAP[mimeType]) {
    return MIME_EXTENSION_MAP[mimeType]
  }
  return 'jpg'
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { imageIds } = BatchDownloadSchema.parse(payload)

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
      .select('id, url, filename, mime_type')
      .in('id', imageIds)
      .eq('user_id', user.id)

    if (assetsError) {
      console.error('Error fetching assets for batch download:', assetsError)
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json({ error: 'No assets found for download' }, { status: 404 })
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

    const zip = new JSZip()

    for (const asset of assets) {
      try {
        const response = await fetch(asset.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch asset ${asset.id}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const extension = getExtension(asset.filename, asset.mime_type)
        const filename = asset.filename || `image-${asset.id}.${extension}`

        zip.file(filename, buffer)
      } catch (error) {
        console.error('Error adding asset to zip:', error)
      }
    }

    const zipFiles = Object.keys(zip.files)
    if (zipFiles.length === 0) {
      return NextResponse.json({ error: 'Unable to prepare download for selected assets' }, { status: 500 })
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    const filename = `retrat-ai-imagens-${new Date().toISOString().split('T')[0]}.zip`

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.byteLength.toString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in POST /api/assets/download/batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
