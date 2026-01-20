import { rewriteNewsletterLinks } from '../link-rewriter'

describe('rewriteNewsletterLinks', () => {
  it('rewrites http links to /r/{code}?sendId=... and inserts rows', async () => {
    const inserts: any[] = []

    const supabase = {
      from: (table: string) => {
        if (table !== 'newsletter_links') throw new Error('unexpected table')
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
              is: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
          insert: async (row: any) => {
            inserts.push(row)
            return { error: null }
          },
        }
      },
    }

    const html = '<a href="https://example.com/x">x</a>'
    const out = await rewriteNewsletterLinks({
      supabase,
      html,
      appUrl: 'https://nexural.test',
      sendId: 'send_1',
      campaignId: 'camp_1',
    })

    expect(inserts.length).toBe(1)
    expect(out.html).toContain('/r/')
    expect(out.html).toContain('sendId=send_1')
  })
})

