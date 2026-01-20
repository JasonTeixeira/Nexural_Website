import { mapMemberPositionRowToCanonical } from '../adapters/member-positions-adapter'

describe('member-positions-adapter (privacy-by-default canon)', () => {
  test('maps legacy member positions row -> canonical Position', () => {
    const p = mapMemberPositionRowToCanonical({
      id: 'pos_1',
      user_id: 'user_1',
      symbol: 'AAPL',
      status: 'open',
      direction: 'long',
      entry_price: 100,
      quantity: 2,
      opened_at: '2020-01-01T00:00:00.000Z',
      notes: 'hello',
    })

    expect(p.id).toBe('pos_1')
    expect(p.owner_type).toBe('member')
    expect(p.owner_id).toBe('user_1')
    expect(p.underlying_symbol).toBe('AAPL')
    expect(p.status).toBe('open')
    expect(p.shares).toBe(2)
  })
})

