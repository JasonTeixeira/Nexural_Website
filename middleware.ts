import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders } from '@/lib/security'
import { createClient } from '@supabase/supabase-js'
// Note: Rate limiting temporarily disabled - will be re-enabled after health check works

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/blog',
  '/faq',
  '/how-it-works',
  '/indicators',
  '/contact',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/confirm',
  '/auth/reset-password',
  '/admin/login',  // Admin login page must be publicly accessible
  '/privacy',
  '/terms-of-service',
  '/legal-disclaimer',
  '/refer',
  '/profile',
  '/community',
  '/leaderboard',
  '/api/health/env',
]

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/admin',
  // '/member-portal',  // Temporarily disabled - page handles its own auth
  '/watchlist',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Authentication check for protected routes
  if (isProtectedRoute && !isPublicRoute) {
    // SIMPLIFIED ADMIN AUTH - Check for simple admin cookie
    if (pathname.startsWith('/admin')) {
      const adminCookie = request.cookies.get('admin_authenticated')
      
      if (!adminCookie || adminCookie.value !== 'true') {
        // Not authenticated, redirect to admin login
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
      
      // Admin is authenticated, allow access
    } else {
      // For other protected routes, use Supabase auth
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseAnonKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)
          
          const authCookies = request.cookies.getAll().filter(cookie => 
            cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
          )
          
          if (authCookies.length === 0) {
            const loginUrl = new URL('/auth/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
          }
          
          const token = authCookies[0]?.value
          if (token) {
            const { data: { user }, error } = await supabase.auth.getUser(token)
            
            if (error || !user) {
              const loginUrl = new URL('/auth/login', request.url)
              loginUrl.searchParams.set('redirect', pathname)
              return NextResponse.redirect(loginUrl)
            }
          }
        } catch (error) {
          console.error('Auth middleware error:', error)
        }
      }
    }
  }
  
  // Rate limiting temporarily disabled - will be re-enabled once health check works
  // TODO: Re-enable rate limiting using lib/rate-limiter.ts directly
  
  // Continue with the request
  const response = NextResponse.next()
  
  // Add security headers to all responses
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
