import { createClient } from '@/lib/supabase/server'

export type EntitlementStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled'

export interface MemberEntitlement {
  userId: string
  status: EntitlementStatus
  tier: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export function isEntitled(ent: MemberEntitlement | null): boolean {
  if (!ent) return false
  if (ent.status !== 'active' && ent.status !== 'trialing') return false
  if (!ent.currentPeriodEnd) return true
  return new Date(ent.currentPeriodEnd).getTime() > Date.now()
}

/**
 * Loads the caller's entitlement based on the current Supabase session.
 * Returns null if unauthenticated or not found.
 */
export async function getMyEntitlement(): Promise<MemberEntitlement | null> {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth?.user?.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('member_entitlements')
    .select('user_id,status,tier,current_period_end,cancel_at_period_end')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null

  return {
    userId: data.user_id,
    status: data.status,
    tier: data.tier,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: !!data.cancel_at_period_end,
  }
}

/** Throws if the current user is not entitled (members-only gating). */
export async function requireEntitlement(): Promise<MemberEntitlement> {
  const ent = await getMyEntitlement()
  if (!isEntitled(ent)) {
    throw new Error('MEMBERSHIP_REQUIRED')
  }
  return ent!
}

