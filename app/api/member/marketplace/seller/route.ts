import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'

/**
 * GET/POST /api/member/marketplace/seller
 * Seller onboarding (profile + terms acceptance).
 * Source of truth: docs/MARKETPLACE_SPEC.md
 */

export async function GET() {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  const { data, error } = await supabase
    .from('marketplace_sellers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ seller: data || null })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const auth = await requireSupabaseUser()
  if ('response' in auth) return auth.response
  const user = auth.user

  const body = await req.json().catch(() => ({}))
  const displayName = String(body.displayName || '').trim()
  const bio = body.bio != null ? String(body.bio).trim() : null
  const supportEmail = body.supportEmail != null ? String(body.supportEmail).trim() : null
  const acceptTerms = body.acceptTerms === true

  if (!displayName) return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
  if (!acceptTerms) return NextResponse.json({ error: 'You must accept marketplace terms' }, { status: 400 })

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('marketplace_sellers')
    .upsert(
      {
        user_id: user.id,
        display_name: displayName,
        bio,
        support_email: supportEmail,
        terms_accepted_at: now,
        status: 'active',
        updated_at: now,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ seller: data })
}
