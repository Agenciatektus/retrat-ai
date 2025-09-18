import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'

// Configure Cloudinary

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const UploadSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(['user_photo', 'reference', 'generated'])
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()

    // Get and validate metadata
    const projectId = formData.get('projectId') as string
    const type = formData.get('type') as string

    try {
      UploadSchema.parse({ projectId, type })
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get files from form data
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
          error: `File type ${file.type} not supported`
        }, { status: 400 })
      }

      if (file.size > maxSize) {
        return NextResponse.json({
          error: `File ${file.name} is too large (max 10MB)`
        }, { status: 400 })
      }
    }

    // Check upload limits
    const { data: existingAssets, error: assetsError } = await supabase
      .from('assets')
      .select('type')
      .eq('project_id', projectId)

    if (assetsError) {
      console.error('Error fetching existing assets:', assetsError)
      return NextResponse.json({ error: 'Failed to check upload limits' }, { status: 500 })
    }

    const existingCount = existingAssets?.filter(asset => asset.type === type).length || 0
    const maxCount = type === 'user_photo' ? 5 : 3

    if (existingCount + files.length > maxCount) {
      return NextResponse.json({
        error: `Maximum ${maxCount} ${type === 'user_photo' ? 'photos' : 'references'} allowed`
      }, { status: 400 })
    }

    // Upload files to Cloudinary and save to database
    const uploadedAssets = []

    for (const file of files) {
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: `retrat-ai/${user.id}/${projectId}`,
              public_id: `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              overwrite: true,
              transformation: type === 'user_photo'
                ? [
                    { width: 1024, height: 1024, crop: 'limit', quality: 'auto' },
                    { format: 'webp' }
                  ]
                : [
                    { width: 1024, height: 1024, crop: 'limit', quality: 'auto' },
                    { format: 'webp' }
                  ]
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error)
                reject(error)
              } else {
                resolve(result)
              }
            }
          ).end(buffer)
        }) as any

        // Save asset record to database
        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .insert({
            project_id: projectId,
            user_id: user.id,
            type,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            metadata: {
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format
            }
          })
          .select()
          .single()

        if (assetError) {
          console.error('Database insert error:', assetError)
          // Cleanup: delete from Cloudinary if database insert fails
          await cloudinary.uploader.destroy(uploadResult.public_id)
          throw new Error('Failed to save asset record')
        }

        uploadedAssets.push(asset)
      } catch (error) {
        console.error('File upload error:', error)
        // Continue with other files, but log the error
      }
    }

    if (uploadedAssets.length === 0) {
      return NextResponse.json({ error: 'All uploads failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      message: `Successfully uploaded ${uploadedAssets.length} file${uploadedAssets.length > 1 ? 's' : ''}`
    })

  } catch (error) {
    console.error('Error in POST /api/upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}