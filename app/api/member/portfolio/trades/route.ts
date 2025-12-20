import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/error-handler';
import { PortfolioService } from '@/lib/portfolio-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolio_id');
    const status = searchParams.get('status') as 'open' | 'closed' | 'cancelled' | undefined;

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID required' }, { status: 400 });
    }

    const trades = await PortfolioService.getTrades(portfolioId, { status });
    
    return NextResponse.json({ trades });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { portfolio_id, symbol, action, quantity, entry_price, stop_loss, take_profit, notes, tags, strategy } = body;

    if (!portfolio_id || !symbol || !action || !quantity || !entry_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const trade = await PortfolioService.addTrade(portfolio_id, user.id, {
      symbol,
      action,
      quantity,
      entry_price,
      stop_loss,
      take_profit,
      notes,
      tags,
      strategy
    });
    
    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trade_id, exit_price, commission } = body;

    if (!trade_id || !exit_price) {
      return NextResponse.json({ error: 'Trade ID and exit price required' }, { status: 400 });
    }

    const trade = await PortfolioService.closeTrade(trade_id, exit_price, commission || 0);
    
    return NextResponse.json({ trade });
  } catch (error) {
    return createErrorResponse(error);
  }
}
