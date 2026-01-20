import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdmin } from '@/lib/auth/admin'
import { rewriteNewsletterLinks } from '@/lib/newsletter/link-rewriter'

const resend = new Resend(process.env.RESEND_API_KEY)

function ensureEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY')
}

function withPixel(html: string, appUrl: string, sendId: string) {
  const pixel = `${appUrl}/api/newsletter/open?sendId=${sendId}`
  const img = `<img src="${pixel}" width="1" height="1" style="display:none" alt="" />`
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${img}</body>`)
  return `${html}${img}`
}

function ensureUnsubscribeLink(html: string, appUrl: string, subscriberId: string) {
  // SSOT: unsubscribe link in every email.
  const url = `${appUrl}/unsubscribe?subscriberId=${encodeURIComponent(subscriberId)}`
  const link = `<p style="margin-top:24px;font-size:12px;color:#666">If you no longer want to receive these emails, you can <a href="${url}">unsubscribe</a>.</p>`
  if (/unsubscribe/i.test(html)) return html
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${link}</body>`)
  return `${html}${link}`
}

export async function POST(req: NextRequest) {
  try {
    ensureEnv()
    const admin = await requireAdmin(['owner', 'support'])
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const body = await req.json()
    const subject = String(body.subject || '').trim()
    const contentHtml = String(body.html || body.content || '').trim()
    const subscribers = Array.isArray(body.subscribers) ? body.subscribers : []
    const fromEmail = String(body.from || 'Nexural Trading <onboarding@resend.dev>')
    const campaignIdRaw = body.campaignId
    const campaignId = campaignIdRaw ? String(campaignIdRaw) : null

    if (!subject) return NextResponse.json({ error: 'subject required' }, { status: 400 })
    if (!contentHtml) return NextResponse.json({ error: 'html/content required' }, { status: 400 })
    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'subscribers required' }, { status: 400 })
    }

    // Use service role for newsletter tables (RLS enabled).
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

    const results = { sent: 0, failed: 0, errors: [] as string[] }

    for (const s of subscribers) {
      const email = String(s.email || '').toLowerCase()
      const subscriberId = String(s.id || '')
      if (!email || !subscriberId) {
        results.failed++
        results.errors.push('subscriber missing id/email')
        continue
      }

      // Create send row so we can embed open tracking.
      // SSOT: sending must be idempotent. If campaignId is provided, we rely on
      // UNIQUE(campaign_id, subscriber_id) to prevent duplicates.
      const { data: sendRow, error: sendErr } = await supabase
        .from('newsletter_sends')
        .upsert(
          {
            campaign_id: campaignId,
            subscriber_id: subscriberId,
            status: 'queued',
          },
          { onConflict: campaignId ? 'campaign_id,subscriber_id' : 'id' }
        )
        .select('id')
        .single()

      if (sendErr || !sendRow?.id) {
        results.failed++
        results.errors.push(`${email}: failed to create send row`)
        continue
      }

      const sendId = sendRow.id
      let html = withPixel(contentHtml, appUrl, sendId)
      const rewritten = await rewriteNewsletterLinks({
        supabase,
        html,
        appUrl,
        sendId,
        campaignId,
      })
      html = rewritten.html
      html = ensureUnsubscribeLink(html, appUrl, subscriberId)

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        html,
      })

      if (error) {
        results.failed++
        results.errors.push(`${email}: ${error.message}`)
        await supabase.from('newsletter_sends').update({ status: 'queued' }).eq('id', sendId)
        continue
      }

      results.sent++
      await supabase
        .from('newsletter_sends')
        .update({
          resend_message_id: data?.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', sendId)
    }

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    console.error('send-v2 error:', e)
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
