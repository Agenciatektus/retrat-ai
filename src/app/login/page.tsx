"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { AuthDebug } from '@/components/debug/AuthDebug'
import { usePostHog } from '@/hooks/usePostHog'
import { useSentry } from '@/hooks/useSentry'
import { Mail, Eye, EyeOff, Chrome, Instagram } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()
  const { capture } = usePostHog()
  const { traceUIAction, captureException, logger, setUser } = useSentry()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    return traceUIAction('Email Login', async () => {
      setLoading(true)
      setError('')

      try {
        logger?.info('Attempting email login', { email })
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          logger?.error('Login failed', { error: error.message, email })
          captureException(new Error(`Login failed: ${error.message}`), {
            email,
            method: 'email',
            errorCode: error.status
          })
          setError(error.message)
          capture('login_failed', {
            method: 'email',
            error: error.message
          })
        } else {
          logger?.info('Login successful', { userId: data.user?.id, email })
          
          // Set user context in Sentry
          setUser({
            id: data.user?.id || '',
            email: data.user?.email || '',
            username: data.user?.user_metadata?.full_name || ''
          })
          
          capture('login_success', {
            method: 'email',
            user_id: data.user?.id
          })
          
          // Let the middleware handle the redirect
          window.location.href = '/dashboard'
        }
      } catch (err) {
        logger?.fatal('Unexpected login error', { error: err, email })
        captureException(err as Error, {
          email,
          method: 'email',
          context: 'handleEmailLogin'
        })
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }, {
      email,
      method: 'email'
    })
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) setError(error.message)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="text-foreground-muted">
            Sign in to your Retrat.ai account
          </p>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            size="lg"
            className="w-full"
            leftIcon={<Chrome className="w-5 h-5" />}
          >
            Continue with Google
          </Button>

          <Button
            disabled={true}
            variant="outline"
            size="lg"
            className="w-full opacity-50 cursor-not-allowed"
            leftIcon={<Instagram className="w-5 h-5" />}
          >
            Continue with Instagram
            <span className="ml-2 text-xs">(Coming Soon)</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-foreground-muted">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Login Form */}
        <Card variant="glass" padding="lg">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              variant="glass"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              variant="glass"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              required
            />

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-accent-gold hover:text-accent-gold-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-foreground-muted">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-accent-gold hover:text-accent-gold-hover transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Debug Component */}
      <AuthDebug />
    </div>
  )
}