'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Get the current domain for the redirect
      const currentDomain = window.location.origin
      const isLocalhost = currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')
      
      // For production, we want to use the actual domain rather than localhost
      // This helps prevent redirect issues after email confirmation
      let redirectUrl = `${currentDomain}/auth/callback`
      
      // If you have a production URL, uncomment the following and replace with your domain
      // if (isLocalhost) {
      //   redirectUrl = 'https://your-production-domain.com/auth/callback'
      // }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })
      if (error) throw error
      router.push('/login?message=Check your email to confirm your account')
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Sign up
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Link 
            href="/login" 
            className="text-primary hover:text-primary/80"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 