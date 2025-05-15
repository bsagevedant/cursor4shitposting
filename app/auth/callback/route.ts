import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
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
              // Handle header already sent errors
            }
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 