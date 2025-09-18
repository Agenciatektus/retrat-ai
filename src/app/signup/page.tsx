"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { Mail, Eye, EyeOff, Chrome, Instagram, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a verification link!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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
            Create your account
          </h1>
          <p className="text-foreground-muted">
            Start creating professional portraits with AI
          </p>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            onClick={handleGoogleSignUp}
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

        {/* Email Sign Up Form */}
        <Card variant="glass" padding="lg">
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <p className="text-success text-sm">{message}</p>
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              variant="glass"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

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
              placeholder="Create a password"
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

            <div className="text-xs text-foreground-muted">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-accent-gold hover:text-accent-gold-hover">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-accent-gold hover:text-accent-gold-hover">
                Privacy Policy
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-foreground-muted">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-accent-gold hover:text-accent-gold-hover transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
