import { POST } from '../route'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

const { createClient } = require('@supabase/supabase-js')

describe('/api/newsletter/unsubscribe', () => {
  it('rejects when missing both subscriberId and email', async () => {
    const req = new Request('http://localhost/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }) as any

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('unsubscribes by subscriberId', async () => {
    const updates: any[] = []
    const events: any[] = []

    const supabase = {
      from: (table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            update: (patch: any) => ({
              eq: (_k: string, v: any) => ({
                select: (_: string) => ({
                  maybeSingle: async () => {
                    updates.push({ patch, id: v })
                    return { data: { id: v, email: 'x@example.com' }, error: null }
                  },
                }),
              }),
            }),
          }
        }

        if (table === 'newsletter_sends') {
          return {
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    maybeSingle: async () => ({ data: { id: 'send_last' }, error: null }),
                  }),
                }),
              }),
            }),
          }
        }

        if (table === 'newsletter_events') {
          return {
            insert: async (row: any) => {
              events.push(row)
              return { error: null }
            },
          }
        }

        throw new Error(`unexpected table ${table}`)
      },
    }

    createClient.mockReturnValue(supabase)

    const req = new Request('http://localhost/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'jest' },
      body: JSON.stringify({ subscriberId: 'sub_1' }),
    }) as any

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(updates).toHaveLength(1)
    expect(events).toHaveLength(1)
    expect(events[0].event_type).toBe('unsubscribed')
  })
})
