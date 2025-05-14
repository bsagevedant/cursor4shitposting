import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/auth/callback']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // If user is not signed in and trying to access a protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('message', 'Please sign in to continue')
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access auth pages
  if (session && ['/login', '/signup'].includes(req.nextUrl.pathname)) {
    const redirectUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 