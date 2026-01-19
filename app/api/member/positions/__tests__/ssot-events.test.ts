// Jest test (repo uses Jest). No Vitest.

// Minimal supabase mock factory
function makeSupabaseMock() {
  const insert = jest.fn().mockResolvedValue({ data: null, error: null })
  const update = jest.fn().mockResolvedValue({ data: { id: 'p1', status: 'closed' }, error: null })
  const select = jest.fn().mockReturnThis()
  const eq = jest.fn().mockReturnThis()
  const single = jest.fn().mockResolvedValue({ data: { id: 'p1', user_id: 'u1', status: 'open' }, error: null })

  const from = jest.fn().mockImplementation((table: string) => {
    if (table === 'position_events') {
      return { insert }
    }
    if (table === 'positions') {
      return { insert, update, select, eq, single }
    }
    return { insert, update, select, eq, single }
  })

  return { from, __spies: { insert, update, select, eq, single } }
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

jest.mock('@/lib/trading-ledger/repository-member-positions', () => ({
  MemberPositionsLedgerRepository: class {
    async listPositions() {
      return { positions: [] }
    }
    async getPositionById(id: string) {
      return { position: { id } }
    }
  },
}))

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
    expect(supabase.from).toHaveBeenCalledWith('position_events')
    expect(supabase.__spies.insert).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'position.opened' })
    )
  })
})
