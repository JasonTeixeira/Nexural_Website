import { NextResponse } from 'next/server'
import { requireEntitlement } from '@/lib/entitlements'

/**
 * For API routes: ensures user is an entitled member.
 * Returns a NextResponse if not entitled, otherwise returns null.
 */
export async function enforceMemberEntitlement(): Promise<NextResponse | null> {
  try {
    await requireEntitlement()
    return null
  } catch (e: any) {
    if (e?.message === 'MEMBERSHIP_REQUIRED') {
      return NextResponse.json({ error: 'Membership required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

