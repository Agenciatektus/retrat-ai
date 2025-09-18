"use client"

import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from 'lucide-react'

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--background)" }}>
      <Card variant="glass" className="text-center max-w-md">
        <CardContent className="p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
            <Search className="w-8 h-8" style={{ color: "var(--accent-gold)" }} />
          </div>
          
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Página não encontrada
          </h1>
          
          <p className="mb-8" style={{ color: "var(--foreground-muted)" }}>
            A página que você está procurando não existe ou foi movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}
            >
              <Home className="w-4 h-4" />
              Ir para Home
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotFoundLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface animate-pulse"></div>
        <div className="h-8 bg-surface animate-pulse rounded mb-2"></div>
        <div className="h-4 bg-surface animate-pulse rounded mb-8"></div>
        <div className="flex gap-3 justify-center">
          <div className="w-32 h-12 bg-surface animate-pulse rounded"></div>
          <div className="w-24 h-12 bg-surface animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundLoading />}>
      <NotFoundContent />
    </Suspense>
  )
}

