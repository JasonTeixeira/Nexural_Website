import { GET } from '../route'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

const { createClient } = require('@supabase/supabase-js')

describe('/r/[code] click tracking', () => {
  it('logs click + increments click_count when sendId provided', async () => {
    const inserts: any[] = []
    const rpcs: any[] = []

    const supabase = {
      from: (table: string) => {
        if (table === 'referral_codes') {
          return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }
        }
        if (table === 'newsletter_links') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { destination_url: 'https://example.com' } }),
              }),
            }),
          }
        }
        if (table === 'newsletter_events') {
          return {
            insert: async (row: any) => {
              inserts.push(row)
              return { error: null }
            },
          }
        }
        throw new Error(`unexpected table ${table}`)
      },
      rpc: async (name: string, args: any) => {
        rpcs.push({ name, args })
        return { data: null, error: null }
      },
    }

    createClient.mockReturnValue(supabase)

    const req = new Request('http://localhost/r/ABC?sendId=send_1', {
      headers: { 'user-agent': 'jest' },
    }) as any

    const res = await GET(req, { params: { code: 'ABC' } } as any)
    expect(res.status).toBe(307)
    expect(inserts).toHaveLength(1)
    expect(inserts[0].event_type).toBe('click')
    expect(rpcs.some((r: any) => r.name === 'increment_newsletter_send_click')).toBe(true)
  })
})

