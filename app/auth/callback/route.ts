import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/member-portal'
  const origin = requestUrl.origin

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange code for session
      const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Auth callback error:', sessionError)
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent('Failed to confirm email. Please try again.')}`
        )
      }

      if (user) {
        // Check if user profile exists, create if not
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        if (!existingProfile) {
          // Create user profile
          const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              username: username,
              display_name: username,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Error creating user profile:', profileError)
            // Continue anyway - profile can be created later
          }

          // 🔥 AUTO-FOLLOW ADMIN USER (CRITICAL FEATURE)
          // Replace 'YOUR_ADMIN_USER_ID_HERE' with your actual admin user ID
          const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || 'YOUR_ADMIN_USER_ID_HERE'
          
          if (ADMIN_USER_ID !== 'YOUR_ADMIN_USER_ID_HERE') {
            try {
              const { error: followError } = await supabase
                .from('follows')
                .insert({
                  follower_id: user.id,
                  following_id: ADMIN_USER_ID,
                  created_at: new Date().toISOString()
                })

              if (followError) {
                console.error('Error auto-following admin:', followError)
                // Don't block signup if follow fails
              } else {
                console.log('✅ New user automatically following admin!')
              }
            } catch (error) {
              console.error('Unexpected error in auto-follow:', error)
            }
          } else {
            console.warn('⚠️  ADMIN_USER_ID not configured - auto-follow disabled')
          }
        }

        // Redirect to member portal with success message
        return NextResponse.redirect(`${origin}${next}?verified=true`)
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent('An unexpected error occurred.')}`
      )
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}
