import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null
  )
}

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code
  const url = new URL(req.url)
  const sendId = url.searchParams.get('sendId')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1) Referral capture: if code matches referral_codes, set cookie and send to signup.
  // Keep this check first so referral links always work.
  const { data: referralCode } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', code)
    .maybeSingle()

  if (referralCode?.user_id) {
    const res = NextResponse.redirect(new URL('/auth/signup', req.url))
    // Store the referrer code in an HttpOnly cookie.
    res.cookies.set('nexural_ref', code, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return res
  }

  const { data: link } = await supabase
    .from('newsletter_links')
    .select('destination_url')
    .eq('code', code)
    .maybeSingle()

  if (!link?.destination_url) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (sendId) {
    try {
      const ip = getClientIp(req)
      const ua = req.headers.get('user-agent') || null
      await supabase.from('newsletter_events').insert({
        send_id: sendId,
        event_type: 'click',
        url: link.destination_url,
        ip,
        user_agent: ua,
      })
      await supabase.rpc('increment_newsletter_send_click', { send_id: sendId })
    } catch {
      // swallow
    }
  }

  return NextResponse.redirect(link.destination_url)
}
