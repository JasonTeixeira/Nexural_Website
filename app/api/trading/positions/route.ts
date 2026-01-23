import { emitDeletionGateHit } from '@/lib/deletion-gate'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/trading/positions
 * Fetch trading positions (active or all)
 */
export async function GET(request: NextRequest) {
  emitDeletionGateHit('legacy.api.trading.positions', { method: 'GET' })
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('live_trades')
      .select('*')
      .order('entry_time', { ascending: false })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching positions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch positions' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = {
      total_positions: data?.length || 0,
      open_positions: data?.filter(p => p.status === 'open').length || 0,
      closed_positions: data?.filter(p => p.status === 'closed').length || 0,
      total_pnl: data?.filter(p => p.pnl).reduce((sum, p) => sum + (p.pnl || 0), 0) || 0,
      winning_trades: data?.filter(p => p.pnl && p.pnl > 0).length || 0,
      losing_trades: data?.filter(p => p.pnl && p.pnl < 0).length || 0
    };

    return NextResponse.json({
      success: true,
      positions: data,
      summary
    });
  } catch (error) {
    console.error('Error in positions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trading/positions
 * Create a new position (open trade)
 */
export async function POST(request: NextRequest) {
  emitDeletionGateHit('legacy.api.trading.positions', { method: 'POST' })
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['symbol', 'direction', 'entry_price', 'position_size', 'stop_loss', 'take_profit'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set defaults
    const position = {
      ...body,
      entry_time: body.entry_time || new Date().toISOString(),
      status: 'open',
      paper_trading: body.paper_trading !== undefined ? body.paper_trading : true
    };

    const { data, error } = await supabase
      .from('live_trades')
      .insert([position])
      .select()
      .single();

    if (error) {
      console.error('Error creating position:', error);
      return NextResponse.json(
        { error: 'Failed to create position' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      position: data
    });
  } catch (error) {
    console.error('Error in positions POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trading/positions
 * Update a position (close trade)
 */
export async function PATCH(request: NextRequest) {
  emitDeletionGateHit('legacy.api.trading.positions', { method: 'PATCH' })
  try {
    const body = await request.json();
    const { trade_id, exit_price, exit_reason } = body;

    if (!trade_id || !exit_price) {
      return NextResponse.json(
        { error: 'Missing required fields: trade_id, exit_price' },
        { status: 400 }
      );
    }

    // Fetch the position
    const { data: position, error: fetchError } = await supabase
      .from('live_trades')
      .select('*')
      .eq('trade_id', trade_id)
      .single();

    if (fetchError || !position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Calculate P&L
    let pnl = 0;
    if (position.direction === 'long') {
      pnl = (exit_price - position.entry_price) * position.position_size;
    } else {
      pnl = (position.entry_price - exit_price) * position.position_size;
    }

    // Subtract commissions ($2.50 per side)
    pnl -= 2.50 * 2 * position.position_size;

    const pnl_percent = (pnl / (position.entry_price * position.position_size)) * 100;

    // Update position
    const { data, error } = await supabase
      .from('live_trades')
      .update({
        exit_price,
        exit_time: new Date().toISOString(),
        exit_reason: exit_reason || 'manual',
        pnl,
        pnl_percent,
        status: 'closed'
      })
      .eq('trade_id', trade_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating position:', error);
      return NextResponse.json(
        { error: 'Failed to update position' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      position: data
    });
  } catch (error) {
    console.error('Error in positions PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
