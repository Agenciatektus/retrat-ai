import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Get admin statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('plan, email')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.email === 'peterson@agenciatektus.com.br' || profile?.plan === 'admin'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get statistics
    const [
      usersResult,
      projectsResult,
      generationsResult,
      subscriptionsResult
    ] = await Promise.all([
      // Total users
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),
      
      // Total projects
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true }),
      
      // Total generations
      supabase
        .from('generations')
        .select('id, status, created_at, completed_at'),
      
      // Active subscriptions
      supabase
        .from('subscriptions')
        .select('id, status, plan_id')
        .eq('status', 'active')
    ])

    // Calculate metrics
    const totalUsers = usersResult.count || 0
    const totalProjects = projectsResult.count || 0
    const generations = generationsResult.data || []
    const totalGenerations = generations.length
    const activeSubscriptions = subscriptionsResult.data?.length || 0

    // Calculate success rate and avg time
    const succeededGenerations = generations.filter(g => g.status === 'completed')
    const failedGenerations = generations.filter(g => g.status === 'failed')
    const errorRate = totalGenerations > 0 ? (failedGenerations.length / totalGenerations) * 100 : 0

    // Calculate average generation time
    const completedWithTimes = succeededGenerations.filter(g => g.created_at && g.completed_at)
    const avgGenerationTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, g) => {
          const start = new Date(g.created_at).getTime()
          const end = new Date(g.completed_at!).getTime()
          return sum + (end - start)
        }, 0) / completedWithTimes.length / 1000 // Convert to seconds
      : 0

    // Mock revenue calculation (would come from Stripe in real implementation)
    const totalRevenue = activeSubscriptions * 29 // Simplified calculation

    const stats = {
      totalUsers,
      totalProjects,
      totalGenerations,
      totalRevenue,
      activeSubscriptions,
      errorRate,
      avgGenerationTime: Math.round(avgGenerationTime),
      storageUsed: 0 // Would calculate from Cloudinary/storage service
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}

