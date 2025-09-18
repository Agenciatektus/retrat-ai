import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/admin/analytics - Get detailed analytics data
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'week' // 'today', 'week', 'month'

    // Calculate date ranges
    const now = new Date()
    let startDate: Date

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default: // week
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get analytics data
    const [
      newUsersResult,
      activeUsersResult,
      generationsResult,
      projectsResult,
      subscriptionsResult
    ] = await Promise.all([
      // New users in period
      supabase
        .from('users')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString()),
      
      // Active users (those who created projects or generations in period)
      supabase
        .from('projects')
        .select('user_id')
        .gte('created_at', startDate.toISOString()),
      
      // Generations in period
      supabase
        .from('generations')
        .select('id, status, created_at, completed_at, user_id')
        .gte('created_at', startDate.toISOString()),
      
      // Top projects by generation count
      supabase
        .from('projects')
        .select('id, name, user_id')
        .limit(10),
      
      // Revenue data (active subscriptions)
      supabase
        .from('subscriptions')
        .select('plan_id, status, created_at')
        .eq('status', 'active')
    ])

    // Process data
    const newUsers = newUsersResult.data || []
    const activeUsers = new Set((activeUsersResult.data || []).map(p => p.user_id))
    const generations = generationsResult.data || []
    const projects = projectsResult.data || []
    const subscriptions = subscriptionsResult.data || []

    // Calculate metrics
    const newUsersCount = newUsers.length
    const activeUsersCount = activeUsers.size
    const generationsCount = generations.length
    const succeededGenerations = generations.filter(g => g.status === 'completed')
    const failedGenerations = generations.filter(g => g.status === 'failed')
    const successRate = generationsCount > 0 ? (succeededGenerations.length / generationsCount) * 100 : 0

    // Calculate average generation time
    const completedWithTimes = succeededGenerations.filter(g => g.created_at && g.completed_at)
    const avgGenerationTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, g) => {
          const start = new Date(g.created_at).getTime()
          const end = new Date(g.completed_at!).getTime()
          return sum + (end - start)
        }, 0) / completedWithTimes.length / 1000 // Convert to seconds
      : 0

    // Calculate revenue (simplified)
    const planPrices = { free: 0, pro: 29, creator: 59, studio: 99 }
    const revenue = subscriptions.reduce((sum, sub) => {
      return sum + (planPrices[sub.plan_id as keyof typeof planPrices] || 0)
    }, 0)

    // Calculate conversion rate (simplified)
    const totalUsers = newUsersCount
    const paidUsers = subscriptions.length
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0

    // Top projects (mock data for now)
    const topProjects = projects.slice(0, 5).map((project, index) => ({
      name: project.name,
      generations: Math.max(1, 10 - index * 2) // Mock generation count
    }))

    // Top users (mock data for now)
    const topUsers = newUsers.slice(0, 5).map((user, index) => ({
      email: user.email || `user${index + 1}@example.com`,
      generations: Math.max(1, 8 - index * 1) // Mock generation count
    }))

    const analytics = {
      newUsersToday: range === 'today' ? newUsersCount : Math.floor(newUsersCount / 7),
      newUsersWeek: newUsersCount,
      activeUsersToday: range === 'today' ? activeUsersCount : Math.floor(activeUsersCount / 7),
      
      generationsToday: range === 'today' ? generationsCount : Math.floor(generationsCount / 7),
      generationsWeek: generationsCount,
      successRate,
      avgGenerationTime: Math.round(avgGenerationTime),
      
      revenueToday: range === 'today' ? revenue : Math.floor(revenue / 30),
      revenueWeek: range === 'week' ? revenue : Math.floor(revenue / 4),
      revenueMonth: revenue,
      conversionRate,
      
      topProjects,
      topUsers
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error in GET /api/admin/analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
