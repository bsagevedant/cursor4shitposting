'use client'

import { PremiumUpgrade } from '@/components/premium-upgrade'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  // Optional: Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-xl font-bold flex items-center">
                🧠 brainrot.ai
              </Link>
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard" className="font-medium text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/history" className="font-medium text-muted-foreground hover:text-primary transition-colors">
                  History
                </Link>
                <Link href="/pricing" className="font-medium text-primary">
                  Pricing
                </Link>
                <Link href="/settings" className="font-medium text-muted-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground">
              Unlock the full power of brainrot.ai with our premium plans
            </p>
          </div>
          
          <PremiumUpgrade />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <div className="space-x-4">
              <Link href="#" className="hover:text-primary">Terms</Link>
              <Link href="#" className="hover:text-primary">Privacy</Link>
              <Link href="#" className="hover:text-primary">Feedback</Link>
              <span>Made in 🇮🇳 by indie hackers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 