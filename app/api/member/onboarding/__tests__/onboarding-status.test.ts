/**
 * Unit tests for SSOT onboarding status endpoint.
 *
 * We mock the Supabase server client to avoid real DB calls.
 */

import { GET } from '../status/route'

jest.mock('@/lib/supabase/server', () => {
  return {
    createClient: async () => {
      return {
        auth: {
          getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
        },
        from: (table: string) => {
          const chain: any = {
            select: () => chain,
            eq: () => chain,
            maybeSingle: async () => {
              if (table === 'follows') return { data: null }
              if (table === 'alert_preferences') return { data: null }
              return { data: null }
            },
          }
          return chain
        },
      }
    },
  }
})

describe('GET /api/member/onboarding/status', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('fails closed when ADMIN_USER_ID is not set', async () => {
    delete process.env.ADMIN_USER_ID
    const res = await GET({} as any)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(false)
    expect(json.state.follows_admin).toBe(false)
  })
})

