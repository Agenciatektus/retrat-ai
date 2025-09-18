"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthUser, UserProfile } from '@/lib/types/auth'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const authUser = session.user as AuthUser
          setUser(authUser)
          await fetchUserProfile(session.user.id, authUser)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session?.user)
        try {
          if (session?.user) {
            const authUser = session.user as AuthUser
            setUser(authUser)
            await fetchUserProfile(session.user.id, authUser)
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string, currentUser?: AuthUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Create profile if it doesn't exist
        await createUserProfile(userId, currentUser)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const createUserProfile = async (userId: string, currentUser?: AuthUser) => {
    try {
      const userToUse = currentUser || user
      const userData = userToUse?.user_metadata
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userToUse?.email || '',
          full_name: userData?.full_name || userData?.name || null,
          avatar_url: userData?.avatar_url || userData?.picture || null,
          plan: 'free'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      setProfile(data)
      return data
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return null
    }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return { error }
      }

      setProfile(data)
      return { data }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return { error }
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isPro: profile?.plan === 'pro'
  }
}
