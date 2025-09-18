import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage } from '@/lib/cloudinary'
import { validateImageFile } from '@/lib/utils/image-validation'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const uploadSchema = z.object({
  type: z.enum(['user_photo', 'reference']),
})

// POST /api/projects/[id]/assets - Upload assets to project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project exists and belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const type = formData.get('type') as string
    const files = formData.getAll('files') as File[]

    if (!type || !files.length) {
      return NextResponse.json({ 
        error: 'Missing required fields: type and files' 
      }, { status: 400 })
    }

    // Validate type
    const validatedType = uploadSchema.parse({ type })

    // Validate files
    const uploadResults = []
    const errors = []

    for (const file of files) {
      // Validate file
      const validationError = validateImageFile(file)
      if (validationError) {
        errors.push(validationError)
        continue
      }

      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Cloudinary
        const cloudinaryResult = await uploadImage(buffer, {
          folder: `retratai/projects/${params.id}/${validatedType.type}`,
          public_id: `${Date.now()}_${file.name.split('.')[0]}`,
        })

        // Save to database
        const { data: asset, error: dbError } = await supabase
          .from('assets')
          .insert({
            project_id: params.id,
            user_id: user.id,
            type: validatedType.type,
            url: cloudinaryResult.secure_url,
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            metadata: {
              cloudinary_public_id: cloudinaryResult.public_id,
              width: cloudinaryResult.width,
              height: cloudinaryResult.height,
              format: cloudinaryResult.format,
              bytes: cloudinaryResult.bytes,
            },
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          errors.push({
            code: 'DATABASE_ERROR',
            message: 'Failed to save asset to database',
            file: file.name,
          })
          continue
        }

        uploadResults.push(asset)
      } catch (uploadError) {
        console.error('Upload error:', uploadError)
        errors.push({
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload file',
          file: file.name,
        })
      }
    }

    // Return results
    return NextResponse.json({
      success: uploadResults.length > 0,
      uploaded: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length > 0 
        ? `${uploadResults.length} files uploaded, ${errors.length} failed`
        : `${uploadResults.length} files uploaded successfully`,
    }, { status: uploadResults.length > 0 ? 201 : 400 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Unexpected error in POST /api/projects/[id]/assets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/projects/[id]/assets - Get project assets
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filter by asset type

    // Verify project exists and belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('assets')
      .select('*')
      .eq('project_id', params.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Add type filter if provided
    if (type && ['user_photo', 'reference', 'generated'].includes(type)) {
      query = query.eq('type', type)
    }

    const { data: assets, error } = await query

    if (error) {
      console.error('Error fetching assets:', error)
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
    }

    return NextResponse.json({ assets: assets || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/projects/[id]/assets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
