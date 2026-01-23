// Jest test (repo uses Jest). No Vitest.

// Minimal supabase mock factory
function makeSupabaseMock() {
  const insert = jest.fn().mockResolvedValue({ data: null, error: null })
  const update = jest.fn().mockResolvedValue({ data: { id: 'p1', status: 'closed' }, error: null })
  const select = jest.fn().mockReturnThis()
  const eq = jest.fn().mockReturnThis()
  const single = jest.fn().mockResolvedValue({ data: { id: 'p1', user_id: 'u1', status: 'open' }, error: null })
  const insertSelectSingle = jest.fn().mockResolvedValue({
    data: { id: 'p_new', user_id: 'u1', status: 'open', opened_at: new Date().toISOString() },
    error: null,
  })

  const from = jest.fn().mockImplementation((table: string) => {
    if (table === 'position_events') {
      return { insert }
    }
    if (table === 'positions') {
      return {
        insert: () => ({ select: () => ({ single: insertSelectSingle }) }),
        update,
        select,
        eq,
        single,
      }
    }
    return { insert, update, select, eq, single }
  })

  return { from, __spies: { insert, update, select, eq, single, insertSelectSingle } }
}

jest.mock('@/lib/auth/server-helpers', () => ({
  requireSupabaseUser: async () => ({ user: { id: 'u1', email: 'u1@example.com' } }),
}))

jest.mock('@/lib/entitlements-api', () => ({
  enforceMemberEntitlement: async () => null,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => (global as any).__supabaseMock,
}))

// NOTE: In this baseline branch the trading-ledger module is not present.
// This test focuses on verifying event emission via the DB (position_events).

describe('SSOT member position event spine', () => {
  beforeEach(() => {
    ;(global as any).__supabaseMock = makeSupabaseMock()
  })

  test('POST /api/member/positions emits position.opened', async () => {
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/member/positions', {
      method: 'POST',
      body: JSON.stringify({ symbol: 'AAPL', entry_price: 100, quantity: 1, direction: 'long' }),
    })

    await POST(req as any)
    const supabase = (global as any).__supabaseMock

    // We should have inserted an event row.
    const eventCall = supabase.__spies.insert.mock.calls.find((c: any[]) => c?.[0]?.event_type === 'position.opened')
    expect(eventCall).toBeTruthy()
  })
})
