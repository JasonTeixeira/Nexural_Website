import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/ops/seed-trading-spine
 * One-time-ish seeder for a clean Supabase project.
 * Protected by CRON_SECRET header.
 *
 * Creates:
 * - 1 stock-like admin position
 * - 1 options-like admin position with 4 legs
 * - targets/stops/partial close events
 */
export async function POST(request: Request) {
  // Protection layers:
  // 1) Vercel deployment protection / bypass token (infrastructure)
  // 2) Our own CRON_SECRET header (application)
  //
  // Note: On some Vercel deployments, header casing/forwarding can vary.
  // We accept a few common variants.
  const token =
    request.headers.get('x-cron-token') ||
    request.headers.get('X-Cron-Token') ||
    request.headers.get('x-seed-token') ||
    request.headers.get('X-Seed-Token')

  const url = new URL(request.url)
  const tokenFromQuery = url.searchParams.get('token')

  const expected = process.env.CRON_SECRET

  const provided = token || tokenFromQuery

  if (!expected || !provided || provided.trim() !== expected.trim()) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        debug: {
          hasCronSecret: !!expected,
          tokenPrefix: provided ? provided.slice(0, 6) : null,
          via: token ? 'header' : tokenFromQuery ? 'query' : null,
        },
      },
      { status: 401 }
    )
  }

  try {
    // Use service role for seeding so inserts work even if RLS is enabled
    // and to ensure we can write events with created_by.
    const supabase = createServiceClient()

    // Find an admin user id to attribute events to.
    // Prefer ADMIN_USER_ID env, otherwise try to find one in profiles.
    const adminUserId = process.env.ADMIN_USER_ID || null
    let createdBy = adminUserId
    if (!createdBy) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .maybeSingle()
      createdBy = data?.id || null
    }

    if (!createdBy) {
      return NextResponse.json(
        { error: 'No admin user found. Set ADMIN_USER_ID or create an admin profile first.' },
        { status: 400 }
      )
    }

    // --- Position 1: “Stock” (still uses same table) ---
    const { data: p1, error: p1Err } = await supabase
      .from('trading_positions')
      .insert({
        symbol: 'AAPL',
        direction: 'LONG',
        entry_price: 200,
        current_price: 200,
        stop_loss: 190,
        targets: [210, 220],
        position_size: 100,
        status: 'active',
        entry_date: new Date().toISOString(),
        notes: 'Seed position (stock-like)',
        quantity: 100,
        position_type: 'stock',
        is_public: true,
        allow_comments: true,
      } as any)
      .select('*')
      .single()
    if (p1Err) throw p1Err

    await supabase.from('position_events').insert([
      {
        position_id: p1.id,
        event_type: 'position.opened',
        event_data: { entry_price: 200, quantity: 100, direction: 'LONG', stop_loss: 190, targets: [210, 220] },
        notes: 'Opened (seed)',
        created_by: createdBy,
      },
      {
        position_id: p1.id,
        event_type: 'position.target_set',
        event_data: { targets: [210, 220] },
        notes: 'Targets set (seed)',
        created_by: createdBy,
      },
      {
        position_id: p1.id,
        event_type: 'position.stop_set',
        event_data: { stop: { prev: null, next: 190 } },
        notes: 'Stop set (seed)',
        created_by: createdBy,
      },
    ] as any)

    // --- Position 2: “Options” with 4 legs ---
    const { data: p2, error: p2Err } = await supabase
      .from('trading_positions')
      .insert({
        symbol: 'SPY',
        direction: 'SHORT',
        entry_price: 5.0,
        current_price: 5.0,
        stop_loss: 8.0,
        targets: [3.5, 2.5],
        position_size: 1,
        status: 'active',
        entry_date: new Date().toISOString(),
        notes: 'Seed position (options-like, 4 legs)',
        quantity: 10,
        position_type: 'iron_condor',
        is_public: true,
        allow_comments: true,
      } as any)
      .select('*')
      .single()
    if (p2Err) throw p2Err

    // legs
    const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .slice(0, 10)

    const { error: legsErr } = await supabase.from('option_legs').insert([
      { position_id: p2.id, leg_order: 1, leg_type: 'call', side: 'sell', strike: 470, expiration: exp, contracts: 10, premium: 1.2 },
      { position_id: p2.id, leg_order: 2, leg_type: 'call', side: 'buy', strike: 475, expiration: exp, contracts: 10, premium: 0.6 },
      { position_id: p2.id, leg_order: 3, leg_type: 'put', side: 'sell', strike: 430, expiration: exp, contracts: 10, premium: 1.1 },
      { position_id: p2.id, leg_order: 4, leg_type: 'put', side: 'buy', strike: 425, expiration: exp, contracts: 10, premium: 0.5 },
    ] as any)
    if (legsErr) throw legsErr

    // events + partial close
    await supabase.from('position_events').insert([
      {
        position_id: p2.id,
        event_type: 'position.opened',
        event_data: { entry_price: 5.0, quantity: 10, direction: 'SHORT', stop_loss: 8.0, targets: [3.5, 2.5] },
        notes: 'Opened (seed)',
        created_by: createdBy,
      },
      {
        position_id: p2.id,
        event_type: 'position.partial_closed',
        event_data: {
          partial_close: {
            prev_quantity: 10,
            new_quantity: 6,
            total_closed: 4,
            legs: [
              { leg_order: 1, contracts_closed: 4, exit_premium: 0.8 },
              { leg_order: 2, contracts_closed: 4, exit_premium: 0.4 },
              { leg_order: 3, contracts_closed: 4, exit_premium: 0.7 },
              { leg_order: 4, contracts_closed: 4, exit_premium: 0.35 },
            ],
          },
          reason: 'Seed partial close',
        },
        notes: 'Partial close (seed)',
        created_by: createdBy,
      },
    ] as any)

    // Update remaining quantity to match partial close
    await supabase
      .from('trading_positions')
      .update({ quantity: 6 } as any)
      .eq('id', p2.id)

    return NextResponse.json({ ok: true, seeded: { stock: p1.id, options: p2.id } })
  } catch (e: any) {
    console.error('seed-trading-spine error:', e)
    return NextResponse.json({ error: 'Seed failed', details: e?.message || String(e) }, { status: 500 })
  }
}
