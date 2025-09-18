"use client"

import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function AuthDebug() {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const [supabaseConfig, setSupabaseConfig] = useState<any>({})
  
  useEffect(() => {
    setSupabaseConfig({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
    })
  }, [])

  const testConnection = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getSession()
      console.log('Test connection result:', { data, error })
    } catch (err) {
      console.error('Test connection error:', err)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-surface border border-border rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2 text-accent-gold">Auth Debug</h3>
      
      <div className="space-y-1 text-foreground-muted">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Profile: {profile ? 'Loaded' : 'None'}</div>
        <div>Supabase URL: {supabaseConfig.url ? 'Set' : 'Missing'}</div>
        <div>Anon Key: {supabaseConfig.hasAnonKey ? `Set (${supabaseConfig.anonKeyLength} chars)` : 'Missing'}</div>
      </div>
      
      <button 
        onClick={testConnection}
        className="mt-2 px-2 py-1 bg-accent-gold text-black text-xs rounded"
      >
        Test Connection
      </button>
    </div>
  )
}
