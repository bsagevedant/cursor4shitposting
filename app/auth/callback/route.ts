import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Extract the origin from the request URL
  // This helps handle redirects properly regardless of domain
  const origin = requestUrl.origin
  
  // Default redirect target after authentication
  const redirectTo = '/dashboard'

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            async getAll() {
              return (await cookieStore).getAll();
            },
            async setAll(cookiesToSet) {
              try {
                const resolvedCookiesStore = await cookieStore;
                cookiesToSet.forEach(({ name, value, options }) =>
                  resolvedCookiesStore.set(name, value, options)
                );
              } catch (error) {
                console.error('Error setting cookies:', error);
              }
            },
          },
        }
      )
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error);
        // Redirect to login with error message on failure
        return NextResponse.redirect(new URL(`/login?error=Authentication failed: ${error.message}`, origin))
      }
    } catch (error) {
      console.error('Exception in auth callback:', error);
      // Redirect to login with generic error on exception
      return NextResponse.redirect(new URL('/login?error=Authentication process failed', origin))
    }
  }

  // Redirect to dashboard on success
  return NextResponse.redirect(new URL(redirectTo, origin))
} 