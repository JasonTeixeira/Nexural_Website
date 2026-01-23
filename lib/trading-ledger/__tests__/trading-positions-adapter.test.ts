import { mapPositionEventRowToCanonical } from '../adapters/trading-positions-adapter'

describe('trading-positions-adapter', () => {
  test('maps legacy entered -> position.opened', () => {
    const ev = mapPositionEventRowToCanonical({
      id: '1',
      position_id: 'p1',
      event_type: 'entered',
      event_date: '2020-01-01T00:00:00.000Z',
    })
    expect(ev.type).toBe('position.opened')
  })

  test('passes through ssot position.opened', () => {
    const ev = mapPositionEventRowToCanonical({
      id: '1',
      position_id: 'p1',
      event_type: 'position.opened',
      event_date: '2020-01-01T00:00:00.000Z',
    })
    expect(ev.type).toBe('position.opened')
  })

  test('maps legacy closed -> position.closed', () => {
    const ev = mapPositionEventRowToCanonical({
      id: '1',
      position_id: 'p1',
      event_type: 'closed',
      event_date: '2020-01-01T00:00:00.000Z',
    })
    expect(ev.type).toBe('position.closed')
  })
})

