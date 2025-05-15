'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import z from 'zod'

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const router = useRouter()

  // Check and reset rate limiting
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedTimestamp = localStorage.getItem('loginAttemptsTimestamp');
    
    if (storedAttempts && storedTimestamp) {
      const attempts = parseInt(storedAttempts);
      const timestamp = parseInt(storedTimestamp);
      const now = Date.now();
      
      // If it's been more than 15 minutes since the first attempt, reset counter
      if (now - timestamp > 15 * 60 * 1000) {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginAttemptsTimestamp');
        setLoginAttempts(0);
        setIsRateLimited(false);
      } else if (attempts >= 5) {
        // If there have been 5 or more attempts in the last 15 minutes, rate limit
        setIsRateLimited(true);
        // Calculate remaining time
        const remainingTime = Math.ceil((15 * 60 * 1000 - (now - timestamp)) / 60000);
        setError(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
      } else {
        setLoginAttempts(attempts);
      }
    }
  }, []);

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Check if rate limited
    if (isRateLimited) {
      return;
    }
    
    try {
      // Validate form data
      const validationResult = loginSchema.safeParse({ email, password });
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        const errorMessage = errors.email?._errors[0] || errors.password?._errors[0] || 'Invalid input';
        setError(errorMessage);
        return;
      }
      
      setIsLoading(true);
      
      // Increment login attempts counter
      const newAttemptCount = loginAttempts + 1;
      setLoginAttempts(newAttemptCount);
      
      // Store login attempts in localStorage with timestamp of first attempt
      if (newAttemptCount === 1) {
        localStorage.setItem('loginAttemptsTimestamp', Date.now().toString());
      }
      localStorage.setItem('loginAttempts', newAttemptCount.toString());
      
      // Rate limit after 5 attempts
      if (newAttemptCount >= 5) {
        setIsRateLimited(true);
        setError('Too many login attempts. Please try again in 15 minutes.');
        setIsLoading(false);
        return;
      }
      
      // Attempt to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Use a generic error message for security
        setError('Invalid email or password. Please try again.');
        return;
      }
      
      // Reset login attempts on successful login
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginAttemptsTimestamp');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">🧠 cursor4shitposting</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isLoading || isRateLimited}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading || isRateLimited}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isRateLimited}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 