import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/trading/performance
 * Fetch trading performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const symbol = searchParams.get('symbol');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Fetch closed trades
    let query = supabase
      .from('live_trades')
      .select('*')
      .eq('status', 'closed')
      .gte('exit_time', startDate.toISOString())
      .lte('exit_time', endDate.toISOString());

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    const { data: trades, error } = await query;

    if (error) {
      console.error('Error fetching performance:', error);
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 500 }
      );
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        success: true,
        metrics: {
          total_trades: 0,
          message: 'No trades in selected period'
        }
      });
    }

    // Calculate metrics
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.pnl && t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl && t.pnl < 0);
    
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length
      : 0;

    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin * winningTrades.length / (avgLoss * losingTrades.length)) : 0;

    // Calculate returns
    const returns = trades.map(t => (t.pnl || 0) / 100000); // Assuming $100k capital
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdReturn = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );

    // Sharpe Ratio (annualized)
    const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;

    // Sortino Ratio (annualized)
    const downsideReturns = returns.filter(r => r < 0);
    const downsideStd = downsideReturns.length > 0
      ? Math.sqrt(
          downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length
        )
      : 0;
    const sortinoRatio = downsideStd > 0 ? (avgReturn / downsideStd) * Math.sqrt(252) : 0;

    // Drawdown calculation
    let runningPnl = 0;
    let peak = 0;
    let maxDrawdown = 0;

    trades.forEach(trade => {
      runningPnl += trade.pnl || 0;
      if (runningPnl > peak) {
        peak = runningPnl;
      }
      const drawdown = (peak - runningPnl) / (100000 + peak);
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Calmar Ratio
    const totalReturn = totalPnl / 100000;
    const calmarRatio = maxDrawdown > 0 ? Math.abs(totalReturn / maxDrawdown) : 0;

    // Average trade duration
    const avgDuration = trades.reduce((sum, t) => {
      const duration = new Date(t.exit_time).getTime() - new Date(t.entry_time).getTime();
      return sum + duration;
    }, 0) / trades.length / (1000 * 60 * 60); // Convert to hours

    // Best and worst trades
    const bestTrade = trades.reduce((best, t) => 
      (t.pnl || 0) > (best.pnl || 0) ? t : best
    , trades[0]);
    const worstTrade = trades.reduce((worst, t) => 
      (t.pnl || 0) < (worst.pnl || 0) ? t : worst
    , trades[0]);

    // Performance by symbol
    const symbolPerformance: Record<string, any> = {};
    trades.forEach(trade => {
      if (!symbolPerformance[trade.symbol]) {
        symbolPerformance[trade.symbol] = {
          trades: 0,
          pnl: 0,
          wins: 0,
          losses: 0
        };
      }
      symbolPerformance[trade.symbol].trades++;
      symbolPerformance[trade.symbol].pnl += trade.pnl || 0;
      if (trade.pnl && trade.pnl > 0) {
        symbolPerformance[trade.symbol].wins++;
      } else if (trade.pnl && trade.pnl < 0) {
        symbolPerformance[trade.symbol].losses++;
      }
    });

    // Calculate win rate for each symbol
    Object.keys(symbolPerformance).forEach(sym => {
      const perf = symbolPerformance[sym];
      perf.win_rate = perf.trades > 0 ? (perf.wins / perf.trades) * 100 : 0;
    });

    const metrics = {
      // Basic metrics
      total_trades: totalTrades,
      winning_trades: winningTrades.length,
      losing_trades: losingTrades.length,
      win_rate: winRate,

      // P&L metrics
      total_pnl: totalPnl,
      total_return_pct: (totalPnl / 100000) * 100,
      avg_win: avgWin,
      avg_loss: avgLoss,
      profit_factor: profitFactor,

      // Risk metrics
      sharpe_ratio: sharpeRatio,
      sortino_ratio: sortinoRatio,
      max_drawdown: maxDrawdown * 100,
      calmar_ratio: calmarRatio,

      // Trade metrics
      avg_trade_duration_hours: avgDuration,
      best_trade: {
        symbol: bestTrade.symbol,
        pnl: bestTrade.pnl,
        date: bestTrade.exit_time
      },
      worst_trade: {
        symbol: worstTrade.symbol,
        pnl: worstTrade.pnl,
        date: worstTrade.exit_time
      },

      // Symbol breakdown
      symbol_performance: symbolPerformance,

      // Period info
      period_days: parseInt(period),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    };

    return NextResponse.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error in performance API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
