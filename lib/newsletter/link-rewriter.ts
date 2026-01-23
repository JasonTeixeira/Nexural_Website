/**
 * Newsletter link rewriting for click tracking.
 *
 * Strategy (SSOT):
 * - Create (or reuse) `newsletter_links` rows for each destination URL per campaign.
 * - Rewrite `<a href="DEST">` to `${appUrl}/r/{code}?sendId={sendId}`
 *
 * This keeps email HTML mostly intact while providing deterministic click tracking.
 */

export type ExtractedLink = {
  originalUrl: string
  code: string
}

function randomCode(len = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

function isTrackableUrl(url: string) {
  if (!url) return false
  if (url.startsWith('#')) return false
  if (url.startsWith('mailto:')) return false
  if (url.startsWith('tel:')) return false
  if (url.startsWith('javascript:')) return false
  return /^https?:\/\//i.test(url)
}

export async function rewriteNewsletterLinks(params: {
  supabase: any
  html: string
  appUrl: string
  sendId: string
  campaignId: string | null
}) {
  const { supabase, html, appUrl, sendId, campaignId } = params

  // If there is no campaignId, we can’t reliably reuse links per campaign.
  // We still can rewrite by creating standalone links with NULL campaign_id.

  const hrefRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi
  const urls = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = hrefRegex.exec(html))) {
    const u = String(m[1] || '')
    if (isTrackableUrl(u)) urls.add(u)
  }

  if (urls.size === 0) return { html, links: [] as ExtractedLink[] }

  const urlToCode = new Map<string, string>()
  const links: ExtractedLink[] = []

  // Ensure a code exists for each URL.
  for (const destination_url of urls) {
    // Try to find existing
    let existingQuery = supabase.from('newsletter_links').select('code').eq('destination_url', destination_url)
    if (campaignId) existingQuery = existingQuery.eq('campaign_id', campaignId)
    else existingQuery = existingQuery.is('campaign_id', null)

    const { data: existing } = await existingQuery.maybeSingle()
    if (existing?.code) {
      urlToCode.set(destination_url, existing.code)
      links.push({ originalUrl: destination_url, code: existing.code })
      continue
    }

    // Insert new with retry on collision
    let code: string | null = null
    for (let i = 0; i < 8; i++) {
      const candidate = randomCode(10)
      const { error } = await supabase.from('newsletter_links').insert({
        campaign_id: campaignId,
        destination_url,
        code: candidate,
      })
      if (!error) {
        code = candidate
        break
      }
      if (!/duplicate|unique/i.test(error.message || '')) throw error
    }

    if (!code) {
      // Fall back to no rewrite for this URL.
      continue
    }

    urlToCode.set(destination_url, code)
    links.push({ originalUrl: destination_url, code })
  }

  // Replace URLs in href attributes (safe-ish because we only replace exact href="url" matches)
  let outHtml = html
  for (const [url, code] of urlToCode.entries()) {
    const tracked = `${appUrl}/r/${code}?sendId=${encodeURIComponent(sendId)}`
    outHtml = outHtml
      .replaceAll(`href="${url}"`, `href="${tracked}"`)
      .replaceAll(`href='${url}'`, `href='${tracked}'`)
  }

  return { html: outHtml, links }
}

