"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  BarChart3, 
  Shield,
  ChevronDown,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import type { AuthUser, UserProfile } from '@/lib/types/auth'

interface UserMenuProps {
  user: AuthUser
  profile: UserProfile | null
  onSignOut: () => void
  className?: string
}

export function UserMenu({ user, profile, onSignOut, className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [router])

  const handleMenuClick = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const isAdmin = profile?.email === 'peterson@agenciatektus.com.br' || profile?.plan === 'admin'
  const isPremium = profile?.plan && ['pro', 'creator', 'studio', 'admin'].includes(profile.plan)

  const menuItems = [
    {
      icon: Settings,
      label: 'Configurações',
      action: () => router.push('/dashboard'), // Redirect to dashboard for now
      show: true
    },
    {
      icon: CreditCard,
      label: 'Billing & Planos',
      action: () => router.push('/billing'),
      show: true
    },
    {
      icon: BarChart3,
      label: 'Analytics & Monitoring',
      action: () => router.push('/admin/analytics'),
      show: isAdmin,
      adminOnly: true
    },
    {
      icon: Shield,
      label: 'Admin Panel',
      action: () => router.push('/admin'),
      show: isAdmin,
      adminOnly: true
    }
  ]

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* User Info Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors"
      >
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {profile?.full_name || user?.email}
          </p>
          <div className="flex items-center gap-1">
            <p className="text-xs text-foreground-muted capitalize">
              {profile?.plan || 'free'} plan
            </p>
            {isPremium && (
              <Crown className="w-3 h-3 text-accent-gold" />
            )}
            {isAdmin && (
              <Shield className="w-3 h-3 text-accent-gold" />
            )}
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-accent-gold-muted flex items-center justify-center">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-accent-gold" />
          )}
        </div>

        <ChevronDown className={`w-4 h-4 text-foreground-muted transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 z-50"
          >
            <Card variant="elevated" className="overflow-hidden">
              <CardContent className="p-0">
                {/* User Info Header */}
                <div className="p-4 border-b border-border bg-surface/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent-gold-muted flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-accent-gold" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {profile?.full_name || 'Usuário'}
                      </p>
                      <p className="text-sm text-foreground-muted truncate">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-gold-muted text-accent-gold capitalize">
                          {profile?.plan || 'free'}
                        </span>
                        {isAdmin && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-gold text-black font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {menuItems.filter(item => item.show).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleMenuClick(item.action)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors ${
                        item.adminOnly ? 'border-l-2 border-accent-gold' : ''
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${
                        item.adminOnly ? 'text-accent-gold' : 'text-foreground-muted'
                      }`} />
                      <span className={`text-sm ${
                        item.adminOnly ? 'text-accent-gold font-medium' : 'text-foreground'
                      }`}>
                        {item.label}
                      </span>
                      {item.adminOnly && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-accent-gold text-black font-medium">
                          Admin
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="my-2 h-px bg-border"></div>

                  {/* Sign Out */}
                  <button
                    onClick={() => handleMenuClick(onSignOut)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-error/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-error" />
                    <span className="text-sm text-error">Sair da Conta</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

