import { GET } from '../route'

jest.mock('@/lib/entitlements-api', () => ({
  enforceMemberEntitlement: async () => null,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'u1' } } }),
    },
    from: (table: string) => {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => ({ data: [], error: null }),
        in: () => ({ data: [], error: null }),
      }

      if (table === 'leaderboard_rollups') {
        // Make the chain fully chainable (the handler calls: select().eq().eq().order().limit())
        chain.limit = () => ({
          data: [
            { user_id: 'u2', timeframe_days: 30, return_pct: 10, total_pnl: 100, total_capital_at_risk: 1000, win_rate: 50, closed_positions: 2, eligible: true, approximate: true, computed_at: new Date().toISOString() },
          ],
          error: null,
        })
        return {
          ...chain,
        }
      }

      if (table === 'user_profiles') {
        chain.in = () => ({
          data: [
            { user_id: 'u2', username: 'u2', display_name: 'User 2', avatar_url: null, bio: 'bio', follower_count: 0, total_positions: 0, portfolio_visibility_mode: 'public' },
          ],
          error: null,
        })
        return { ...chain }
      }

      return chain
    },
  }),
}))

describe('member leaderboard approximate labeling', () => {
  it('returns is_approximate=true when any row is approximate', async () => {
    const req = { url: 'http://localhost:3000/api/member/leaderboard?timeframe=30&limit=10' } as any
    const res = await GET(req)
    const json = await res.json()
    expect(json.is_approximate).toBe(true)
    expect(json.items[0].approximate).toBe(true)
  })
})
