/**
 * SSOT: blocked/muted users should not appear in the feed.
 */

import { GET } from '../../ssot-feed/route'

jest.mock('@/lib/entitlements-api', () => ({
  enforceMemberEntitlement: async () => null,
}))

const mockSupabase: any = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'viewer-1' } } }),
  },
  from: (table: string) => {
    const chain: any = {
      select: () => chain,
      in: () => chain,
      order: () => chain,
      limit: () => chain,
      lt: () => chain,
      gt: () => chain,
      eq: () => chain,
      maybeSingle: async () => ({ data: null }),
      then: undefined,
    }

    // Provide table-specific terminal responses.
    if (table === 'user_blocks') {
      // viewer blocks actor-2
      chain.eq = (_col: string, val: string) => {
        if (val === 'viewer-1') {
          return {
            ...chain,
            data: [{ blocked_user_id: 'actor-2' }],
          }
        }
        return chain
      }
      return chain
    }

    if (table === 'user_mutes') {
      chain.eq = () => ({ ...chain, data: [] })
      return chain
    }

    if (table === 'follows') {
      chain.eq = () => ({ ...chain, data: [] })
      return chain
    }

    if (table === 'position_events') {
      // Return two events: actor-1 visible, actor-2 blocked
      return {
        ...chain,
        select: () => ({
          ...chain,
          in: () => ({
            ...chain,
            order: () => ({
              ...chain,
              limit: async () => ({
                data: [
                  { id: 'e1', position_id: 'p1', event_type: 'position.opened', event_date: '2026-01-01T00:00:00Z', actor_id: 'actor-1' },
                  { id: 'e2', position_id: 'p2', event_type: 'position.opened', event_date: '2026-01-01T00:00:00Z', actor_id: 'actor-2' },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }
    }

    if (table === 'trading_positions') {
      chain.in = () => ({ ...chain, data: [], error: null })
      return chain
    }

    if (table === 'positions') {
      chain.in = () => ({ ...chain, data: [], error: null })
      return chain
    }

    if (table === 'user_profiles') {
      chain.in = () => ({ ...chain, data: [] })
      return chain
    }

    if (table === 'feed_last_seen') {
      chain.upsert = async () => ({ data: null, error: null })
      return chain
    }

    return chain
  },
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockSupabase,
}))

describe('SSOT feed safety filters', () => {
  it('filters blocked actors from feed items', async () => {
    const req = { url: 'http://localhost:3000/api/member/ssot-feed?limit=10' } as any
    const res = await GET(req)
    const json = await res.json()
    const ids = (json.items || []).map((it: any) => it.id)
    expect(ids).toContain('e1')
    expect(ids).not.toContain('e2')
  })
})

