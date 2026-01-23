/**
 * SSOT: only verified purchasers can review marketplace products.
 */

import { POST } from '../reviews/route'

const makeReq = (body: any) =>
  ({
    json: async () => body,
  }) as any

describe('POST /api/member/marketplace/reviews', () => {
  it('returns 403 when user has no entitlement', async () => {
    jest.resetModules()

    jest.doMock('@/lib/supabase/server', () => ({
      createClient: async () => ({
        auth: {
          getUser: async () => ({ data: { user: { id: 'buyer-1' } }, error: null }),
        },
        from: (table: string) => {
          const chain: any = {
            select: () => chain,
            eq: () => chain,
            maybeSingle: async () => ({ data: null }),
            order: () => chain,
            upsert: async () => ({ error: null }),
          }
          return chain
        },
      }),
    }))

    const { POST: PostHandler } = await import('../reviews/route')

    const res = await PostHandler(
      makeReq({ product_id: 'prod-1', rating: 5, body: 'Great' })
    )
    const json = await res.json()
    expect(res.status).toBe(403)
    expect(json.error).toMatch(/verified purchasers/i)
  })
})

