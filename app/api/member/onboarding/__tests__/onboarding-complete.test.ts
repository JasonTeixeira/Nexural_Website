import { GET as statusGET } from '@/app/api/member/onboarding/status/route'
import { POST as completePOST } from '@/app/api/member/onboarding/complete/route'

// We mock the server supabase client so this test is deterministic.
jest.mock('@/lib/supabase/server', () => {
  const makeChain = (result: any) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  })

  const from = jest.fn((table: string) => {
    if (table === 'follows') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'f1' } }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
      }
    }
    if (table === 'alert_preferences') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { admin_position_opened: true, admin_position_closed: false },
        }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
      }
    }
    return makeChain({ data: null })
  })

  return {
    createClient: async () => ({
      auth: {
        getUser: async () => ({
          data: { user: { id: 'u1' } },
          error: null,
        }),
      },
      from,
    }),
  }
})

describe('onboarding complete + status', () => {
  beforeEach(() => {
    process.env.ADMIN_USER_ID = 'admin1'
  })

  it('complete returns ok', async () => {
    const res = await completePOST(new Request('http://localhost') as any)
    expect(res.status).toBe(200)
  })

  it('status returns ok=true when follow + alerts enabled', async () => {
    const res = await statusGET(new Request('http://localhost') as any)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('uses canonical follows table (not user_follows)', async () => {
    const upserts: any[] = []
    const supabaseMock: any = {
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }),
      },
      from: (table: string) => {
        return {
          upsert: async (payload: any) => {
            upserts.push({ table, payload })
            return { error: null }
          },
        }
      },
    }

    jest.resetModules()
    jest.doMock('@/lib/supabase/server', () => ({ createClient: async () => supabaseMock }))
    const { POST } = await import('../complete/route')

    const res = await POST(new Request('http://localhost/api/member/onboarding/complete', { method: 'POST' }) as any)
    expect(res.status).toBe(200)
    expect(upserts.some((u) => u.table === 'follows')).toBe(true)
    expect(upserts.some((u) => u.table === 'user_follows')).toBe(false)
  })
})
