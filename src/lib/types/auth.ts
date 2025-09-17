import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  user_metadata: {
    full_name?: string
    avatar_url?: string
    picture?: string
    name?: string
  }
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'pro'
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export interface OnboardingState {
  currentStep: number
  steps: OnboardingStep[]
  completed: boolean
}