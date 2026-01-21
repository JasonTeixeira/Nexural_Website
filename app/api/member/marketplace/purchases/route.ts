import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'

/**
 * GET /api/member/marketplace/purchases
 * Lists active entitlements for the current user.
 */
export async function GET() {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response

  const { data, error } = await supabase
    .from('marketplace_entitlements')
    .select('id,status,granted_at,product:marketplace_products(id,slug,title,price_cents,currency)')
    .eq('buyer_user_id', auth.user.id)
    .eq('status', 'active')
    .order('granted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

