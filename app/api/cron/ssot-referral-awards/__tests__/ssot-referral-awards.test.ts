import { POST } from '../route'

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(),
}))

const { createServiceClient } = require('@/lib/supabase/service')

function mockReq(headers: Record<string, string>) {
  return new Request('http://localhost/api/cron/ssot-referral-awards', {
    method: 'POST',
    headers,
  })
}

describe('ssot-referral-awards cron', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'secret'
  })

  it('rejects without cron token', async () => {
    const res = await POST(mockReq({}))
    expect(res.status).toBe(401)
  })

  it('awards only when email is confirmed and idempotent', async () => {
    const inserts: any[] = []

    const svc = {
      from: (table: string) => {
        if (table === 'referral_events') {
          return {
            select: () => ({
              order: () => ({
                limit: async () => ({
                  data: [
                    { id: 're1', referrer_user_id: 'u1', referred_user_id: 'u2', created_at: new Date().toISOString() },
                    { id: 're2', referrer_user_id: 'u1', referred_user_id: 'u3', created_at: new Date().toISOString() },
                  ],
                  error: null,
                }),
              }),
            }),
          }
        }

        if (table === ('auth.users' as any)) {
          return {
            select: () => ({
              eq: (_: string, id: string) => ({
                maybeSingle: async () => ({
                  data:
                    id === 'u2'
                      ? { id: 'u2', email_confirmed_at: new Date().toISOString() }
                      : { id: 'u3', email_confirmed_at: null },
                  error: null,
                }),
              }),
            }),
          }
        }

        if (table === 'points_ledger') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  contains: (_: string, meta: any) => ({
                    maybeSingle: async () => ({
                      // Pretend none exist initially.
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
            insert: async (row: any) => {
              inserts.push(row)
              return { error: null }
            },
          }
        }

        throw new Error(`unexpected table: ${table}`)
      },
    }

    createServiceClient.mockReturnValue(svc)

    const res = await POST(mockReq({ 'x-cron-token': 'secret' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.awarded).toBe(1)
    expect(inserts).toHaveLength(1)
    expect(inserts[0].event_type).toBe('referral_signup_verified')
    expect(inserts[0].metadata.referred_user_id).toBe('u2')
  })
})

