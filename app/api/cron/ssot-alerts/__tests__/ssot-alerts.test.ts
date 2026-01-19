// Jest test (repo uses Jest). No Vitest.

function makeServiceSupabaseMock(opts?: {
  events?: any[]
  follows?: any[]
  alertPrefs?: any[]
  followSettings?: any[]
  adminPositionIds?: Set<string>
}) {
  const events = opts?.events || []
  const follows = opts?.follows || []
  const alertPrefs = opts?.alertPrefs || []
  const followSettings = opts?.followSettings || []
  const adminPositionIds = opts?.adminPositionIds || new Set<string>()

  const select = jest.fn().mockReturnThis()
  const inFn = jest.fn().mockReturnThis()
  const gte = jest.fn().mockReturnThis()
  const order = jest.fn().mockResolvedValue({ data: events, error: null })

  const eq = jest.fn().mockImplementation((col: string, val: any) => {
    // For follow_notification_settings, the code uses .eq('following_id', actor)
    ;(eq as any).__lastEq = { col, val }
    return {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: followSettings, error: null }),
    }
  })

  const maybeSingle = jest.fn().mockImplementation(async () => {
    // trading_positions lookup
    return { data: null, error: null }
  })

  const from = jest.fn().mockImplementation((table: string) => {
    if (table === 'position_events') {
      return { select, in: inFn, gte, order }
    }
    if (table === 'follows') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: follows, error: null }),
      }
    }
    if (table === 'alert_preferences') {
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: alertPrefs, error: null }),
      }
    }
    if (table === 'follow_notification_settings') {
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: followSettings, error: null }),
      }
    }
    if (table === 'trading_positions') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation((_c: string, positionId: string) => {
          return {
            maybeSingle: jest.fn().mockResolvedValue({
              data: adminPositionIds.has(positionId)
                ? { id: positionId, ticker: 'AAPL', company_name: 'Apple', created_by: 'admin' }
                : null,
              error: null,
            }),
          }
        }),
      }
    }
    return { select, in: inFn, gte, order, eq, maybeSingle }
  })

  return { from }
}

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => (global as any).__svcSupabase,
}))

jest.mock('@/lib/activity-writer', () => ({
  activityWriter: {
    notify: jest.fn().mockResolvedValue({ id: 'n1' }),
  },
}))

describe('SSOT alerts cron dispatcher', () => {
  beforeEach(() => {
    ;(require('@/lib/activity-writer').activityWriter.notify as jest.Mock).mockClear()
    process.env.CRON_SECRET = 'secret'
    delete process.env.ADMIN_USER_ID
  })

  test('skips member alerts by default unless opted-in', async () => {
    ;(global as any).__svcSupabase = makeServiceSupabaseMock({
      events: [
        {
          id: 'e1',
          position_id: 'p1',
          event_type: 'position.opened',
          event_date: new Date().toISOString(),
          actor_id: 'member1',
          amendment_class: null,
        },
      ],
      follows: [{ follower_id: 'u1' }],
      followSettings: [
        { user_id: 'u1', position_opened: false, position_closed: false, position_stop_hit: false, position_target_hit: false },
      ],
    })

    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/cron/ssot-alerts?sinceMinutes=60', {
      method: 'POST',
      headers: { 'x-cron-token': 'secret' },
    })

    await POST(req)
    const notify = require('@/lib/activity-writer').activityWriter.notify as jest.Mock
    expect(notify).toHaveBeenCalledTimes(0)
  })

  test('admin alerts fan out to followers when ADMIN_USER_ID is set and not opted out', async () => {
    process.env.ADMIN_USER_ID = 'admin1'
    ;(global as any).__svcSupabase = makeServiceSupabaseMock({
      events: [
        {
          id: 'e2',
          position_id: 'tp1',
          event_type: 'position.opened',
          event_date: new Date().toISOString(),
          actor_id: 'adminActor',
          amendment_class: null,
        },
      ],
      adminPositionIds: new Set(['tp1']),
      follows: [{ follower_id: 'u2' }, { follower_id: 'u3' }],
      alertPrefs: [{ user_id: 'u3', admin_trade_alerts_enabled: false }],
    })

    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/cron/ssot-alerts?sinceMinutes=60', {
      method: 'POST',
      headers: { 'x-cron-token': 'secret' },
    })

    await POST(req)
    const notify = require('@/lib/activity-writer').activityWriter.notify as jest.Mock
    // u2 gets it (no prefs row => default ON); u3 opted out
    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ userId: 'u2', dedupeKey: 'ssot_event:e2' }))
  })
})

