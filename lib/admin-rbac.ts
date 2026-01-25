import { NextRequest } from 'next/server'

/**
 * Admin RBAC (SSOT)
 *
 * Goal: one consistent, RBAC-ready auth mechanism for all /api/admin/*.
 *
 * v1 decision (per docs/admin-control-plane/02_RBAC_PERMISSIONS.md):
 * - Use secure httpOnly cookies set by /api/admin/login
 *   - admin_authenticated=true
 *   - admin_session=<admin_user_id>
 * - Look up admin_users row via service-role supabase to get role.
 */

export type AdminRole = 'owner' | 'support' | 'content'

export type AdminAuthContext = {
  adminUserId: string
  role: AdminRole
}

export function getAdminCookies(req: NextRequest) {
  return {
    adminAuthenticated: req.cookies.get('admin_authenticated')?.value === 'true',
    adminSession: req.cookies.get('admin_session')?.value || null,
  }
}

function getSupabaseAdminClient() {
  // Lazy import so the module stays server-only.
  const { createClient } = require('@supabase/supabase-js')
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase credentials not configured')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function requireAdmin(req: NextRequest): Promise<AdminAuthContext | null> {
  const { adminAuthenticated, adminSession } = getAdminCookies(req)
  if (!adminAuthenticated || !adminSession) return null

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, role, is_active')
    .eq('id', adminSession)
    .single()

  if (error || !data || !data.is_active) return null

  // Normalize role strings to our SSOT roles.
  const role = String(data.role || '').toLowerCase() as AdminRole
  if (!['owner', 'support', 'content'].includes(role)) return null

  return {
    adminUserId: String(data.id),
    role,
  }
}

export function requireRole(ctx: AdminAuthContext, allowed: AdminRole[]): boolean {
  return allowed.includes(ctx.role)
}
