import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * POST /api/newsletter/unsubscribe
 *
 * Public unsubscribe endpoint.
 * SSOT: unsubscribe link in every email + do-not-email honored globally.
 *
 * Accepts either:
 * - subscriberId (preferred, from unsubscribe link)
 * - email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const subscriberId = (body.subscriberId || '').toString().trim() || null
    const emailRaw = (body.email || '').toString().trim()
    const email = emailRaw ? emailRaw.toLowerCase() : null

    if (!subscriberId && !email) {
      return NextResponse.json({ error: 'subscriberId or email is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const patch: any = {
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let q = supabase.from('newsletter_subscribers').update(patch)
    if (subscriberId) q = q.eq('id', subscriberId)
    else q = q.eq('email', email)

    const { data: updated, error } = await q.select('id,email').maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Optional: attach most recent send_id for traceability.
    let lastSendId: string | null = null
    if (updated?.id) {
      const { data: lastSend } = await supabase
        .from('newsletter_sends')
        .select('id')
        .eq('subscriber_id', updated.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      lastSendId = lastSend?.id || null
    }

    // Best-effort event log. We don't always have a send_id here.
    if (updated?.id) {
      const { error: evtErr } = await supabase.from('newsletter_events').insert({
        send_id: lastSendId,
        event_type: 'unsubscribed',
        url: null,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null,
      } as any)
      if (evtErr) {
        // swallow (best-effort)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('newsletter unsubscribe error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
