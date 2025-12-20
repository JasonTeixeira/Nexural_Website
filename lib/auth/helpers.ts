import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server-side helper to get current user
 * Use in Server Components
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

/**
 * Server-side helper to require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error getting profile:', error)
    return null
  }
  
  return data
}

/**
 * Create user profile after signup
 */
export async function createUserProfile(userId: string, username: string, email: string) {
  const supabase = await createClient()
  
  // Check if username is taken
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('username', username)
    .single()
  
  if (existing) {
    throw new Error('Username already taken')
  }
  
  // Create profile
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      username: username,
      display_name: email.split('@')[0], // Use email prefix as initial display name
      is_profile_public: true,
    })
    .select()
    .single()
  
  if (error) {
    throw error
  }
  
  // Create default portfolio
  await supabase
    .from('portfolios')
    .insert({
      user_id: userId,
      name: 'Main Portfolio',
      description: 'My default portfolio',
      visibility: 'private',
      is_default: true,
    })
  
  return data
}

/**
 * Get user's portfolios
 */
export async function getUserPortfolios(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error getting portfolios:', error)
    return []
  }
  
  return data
}

/**
 * Get default portfolio for user
 */
export async function getDefaultPortfolio(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()
  
  if (error) {
    // If no default portfolio, get the first one
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single()
    
    return portfolios
  }
  
  return data
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('username', username)
    .single()
  
  return !data && !error
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: {
  display_name?: string
  bio?: string
  avatar_url?: string
  website_url?: string
  twitter_handle?: string
  is_profile_public?: boolean
  show_performance?: boolean
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    throw error
  }
  
  return data
}
