import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/trading/signals
 * Fetch recent trading signals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const symbol = searchParams.get('symbol');
    const action = searchParams.get('action');

    let query = supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    if (action) {
      query = query.eq('action_taken', action);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching signals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch signals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signals: data,
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error in signals API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trading/signals
 * Create a new trading signal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('signals')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating signal:', error);
      return NextResponse.json(
        { error: 'Failed to create signal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signal: data
    });
  } catch (error) {
    console.error('Error in signals POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
