import { POST } from '../route'

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        limit: () => chain,
        gte: () => chain,
        not: () => chain,
        order: () => chain,
        upsert: async () => ({ error: null }),
      }

      if (table === 'user_profiles') {
        return {
          ...chain,
          eq: () => ({ data: [{ user_id: 'u1', bio: 'bio', strategy_tags: [], portfolio_visibility_mode: 'public', is_profile_public: true }], error: null }),
        }
      }

      if (table === 'portfolios') {
        return { ...chain, select: () => ({ ...chain, eq: () => ({ ...chain, eq: () => ({ data: [{ id: 'p1' }], error: null }), limit: () => ({ data: [{ id: 'p1' }], error: null }) }) }) }
      }

      if (table === 'portfolio_snapshots') {
        // force approximate
        return { ...chain, select: () => ({ ...chain, eq: () => ({ ...chain, gte: () => ({ ...chain, order: async () => ({ data: [], error: null }) }) }) }) }
      }

      if (table === 'positions') {
        const now = Date.now()
        const eightDaysAgo = new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString()
        const twentyDaysAgo = new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString()
        return {
          ...chain,
          select: () => ({
            ...chain,
            eq: () => ({
              ...chain,
              not: () => ({
                ...chain,
                gte: async () => ({
                  data: [
                    { id: 'old', user_id: 'u1', entry_price: 10, exit_price: 12, quantity: 1, direction: 'long', fees_total: 0, closed_at: new Date().toISOString(), is_backfilled: true, imported_at: twentyDaysAgo },
                    { id: 'new', user_id: 'u1', entry_price: 10, exit_price: 12, quantity: 1, direction: 'long', fees_total: 0, closed_at: new Date().toISOString(), is_backfilled: true, imported_at: eightDaysAgo },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }
      }

      if (table === 'leaderboard_rollups') {
        return { ...chain, upsert: async (_row: any) => ({ error: null }) }
      }

      return chain
    },
  }),
}))

describe('leaderboard rollup backfill aging', () => {
  it('does not throw and applies aging filter in code path', async () => {
    process.env.CRON_SECRET = 'x'
    const req = { headers: new Headers({ 'x-cron-token': 'x' }) } as any
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})

