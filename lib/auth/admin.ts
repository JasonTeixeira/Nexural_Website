import { createClient as createServerClient } from '@/lib/supabase/server'

export interface AdminProfile {
  id: string
  email?: string
  is_admin: boolean
  role?: 'owner' | 'support' | 'member'
}

export type AdminRole = 'owner' | 'support'

/**
 * Server-side admin guard.
 *
 * - Requires a valid Supabase session
 * - Requires profiles.is_admin = true
 */
export async function requireAdmin(requiredRoles: AdminRole[] = ['owner', 'support']) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, status: 401 as const, error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,is_admin,role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return { ok: false as const, status: 500 as const, error: 'Failed to load profile' }
  }

  const role = (profile as any)?.role as AdminProfile['role']

  // Backward compatibility: treat is_admin=true as owner if role isn't set yet.
  const resolvedRole: AdminProfile['role'] = role || (profile?.is_admin ? 'owner' : 'member')

  if (!profile?.is_admin || !resolvedRole || !requiredRoles.includes(resolvedRole as AdminRole)) {
    return { ok: false as const, status: 403 as const, error: 'Forbidden' }
  }

  return {
    ok: true as const,
    supabase,
    user,
    profile: { ...(profile as AdminProfile), role: resolvedRole },
  }
}

export async function requireOwner() {
  return requireAdmin(['owner'])
}
