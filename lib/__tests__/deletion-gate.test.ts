import { emitDeletionGateHit } from '../deletion-gate'

describe('emitDeletionGateHit', () => {
  it('emits stable JSON with type/tag/ts', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    emitDeletionGateHit('legacy.api.trading.positions', { method: 'GET' })
    expect(spy).toHaveBeenCalledTimes(1)
    const arg = String(spy.mock.calls[0][0])
    const parsed = JSON.parse(arg)
    expect(parsed.type).toBe('DELETION_GATE_HIT')
    expect(parsed.tag).toBe('legacy.api.trading.positions')
    expect(parsed.meta.method).toBe('GET')
    expect(typeof parsed.ts).toBe('string')
    spy.mockRestore()
  })
})

