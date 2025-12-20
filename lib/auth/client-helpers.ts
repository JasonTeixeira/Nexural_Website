'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Client-side helper to sign in with OAuth
 * Use in client components
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'discord') {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) {
    throw error
  }
}
