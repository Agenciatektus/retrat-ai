"use client"

import { useAuth } from '@/hooks/useAuth'
import { UserMenu } from './UserMenu'
import { Camera } from 'lucide-react'
import Link from 'next/link'

interface AppHeaderProps {
  title?: string
  subtitle?: string
  showUserMenu?: boolean
  className?: string
}

export function AppHeader({ 
  title = "Retrat.ai", 
  subtitle,
  showUserMenu = true,
  className 
}: AppHeaderProps) {
  const { user, profile, signOut } = useAuth()

  return (
    <header className={`border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-accent-gold" />
              <span className="font-heading text-2xl font-bold text-foreground">
                Retrat.ai
              </span>
            </div>
            {subtitle && (
              <span className="text-foreground-muted">• {subtitle}</span>
            )}
          </Link>

          {/* User Menu */}
          {showUserMenu && user && (
            <UserMenu 
              user={user}
              profile={profile}
              onSignOut={signOut}
            />
          )}
        </div>
      </div>
    </header>
  )
}
