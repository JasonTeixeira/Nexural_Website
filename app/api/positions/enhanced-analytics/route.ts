import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Position {
  id: string
  ticker: string
  company_name: string
  entry_date: string
  exit_date: string | null
  entry_price: number
  exit_price: number | null
  shares: number
  direction: string
  status: string
  realized_pnl: number | null
  realized_pnl_pct: number | null
  stop_loss: number
  r_multiple: number | null
}

interface StreakData {
  currentWinStreak: number
  longestWinStreak: number
  currentLossStreak: number
  longestLossStreak: number
  lastTradeWon: boolean
}

export async function GET() {
  try {
    // Fetch all closed positions ordered by exit date
    const { data: closedPositions, error } = await supabase
      .from('trading_positions')
      .select('*')
      .eq('status', 'closed')
      .not('exit_date', 'is', null)
      .order('exit_date', { ascending: true })

    if (error) throw error

    if (!closedPositions || closedPositions.length === 0) {
      return NextResponse.json({
        streaks: {
          currentWinStreak: 0,
          longestWinStreak: 0,
          currentLossStreak: 0,
          longestLossStreak: 0,
          lastTradeWon: false,
        },
        bestWorst: {
          bestTrade: null,
          worstTrade: null,
          bestRMultiple: null,
          longestWinner: null,
        },
        benchmarks: {
          yourReturn: 0,
          spyReturn: 0,
          qqqReturn: 0,
          outperformanceSpy: 0,
          outperformanceQqq: 0,
          period: 'No trades yet',
        },
        milestones: [],
      })
    }

    // Calculate streaks
    const streaks = calculateStreaks(closedPositions)

    // Find best and worst trades
    const bestWorst = findBestWorstTrades(closedPositions)

    // Calculate benchmark comparisons
    const benchmarks = await calculateBenchmarks(closedPositions)

    // Generate milestones
    const milestones = generateMilestones(closedPositions)

    return NextResponse.json({
      streaks,
      bestWorst,
      benchmarks,
      milestones,
    })
  } catch (error) {
    console.error('Error fetching enhanced analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enhanced analytics' },
      { status: 500 }
    )
  }
}

function calculateStreaks(positions: Position[]): StreakData {
  let currentWinStreak = 0
  let currentLossStreak = 0
  let longestWinStreak = 0
  let longestLossStreak = 0
  let tempWinStreak = 0
  let tempLossStreak = 0
  let lastTradeWon = false

  // Process trades from oldest to newest
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i]
    const pnl = position.realized_pnl || 0
    const isWin = pnl > 0

    if (isWin) {
      tempWinStreak++
      tempLossStreak = 0
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak)
    } else {
      tempLossStreak++
      tempWinStreak = 0
      longestLossStreak = Math.max(longestLossStreak, tempLossStreak)
    }

    // Update current streaks (only the last trade matters for "current")
    if (i === positions.length - 1) {
      currentWinStreak = tempWinStreak
      currentLossStreak = tempLossStreak
      lastTradeWon = isWin
    }
  }

  return {
    currentWinStreak,
    longestWinStreak,
    currentLossStreak,
    longestLossStreak,
    lastTradeWon,
  }
}

function findBestWorstTrades(positions: Position[]) {
  let bestTrade = null
  let worstTrade = null
  let bestRMultiple = null
  let longestWinner = null

  for (const position of positions) {
    const pnl = position.realized_pnl || 0
    const pnlPct = position.realized_pnl_pct || 0
    const rMultiple = position.r_multiple || 0
    const entryDate = new Date(position.entry_date)
    const exitDate = position.exit_date ? new Date(position.exit_date) : new Date()
    const daysHeld = Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

    // Best trade by P&L
    if (!bestTrade || pnl > (bestTrade.pnl || 0)) {
      bestTrade = {
        id: position.id,
        ticker: position.ticker,
        pnl,
        pnlPct,
        rMultiple,
        entryDate: position.entry_date,
        daysHeld,
      }
    }

    // Worst trade by P&L
    if (!worstTrade || pnl < (worstTrade.pnl || 0)) {
      worstTrade = {
        id: position.id,
        ticker: position.ticker,
        pnl,
        pnlPct,
        rMultiple,
        entryDate: position.entry_date,
        daysHeld,
      }
    }

    // Best R-Multiple
    if (rMultiple > 0 && (!bestRMultiple || rMultiple > (bestRMultiple.rMultiple || 0))) {
      bestRMultiple = {
        id: position.id,
        ticker: position.ticker,
        rMultiple,
        pnl,
      }
    }

    // Longest winner (only winning trades)
    if (pnl > 0 && (!longestWinner || daysHeld > (longestWinner.daysHeld || 0))) {
      longestWinner = {
        id: position.id,
        ticker: position.ticker,
        daysHeld,
        pnl,
      }
    }
  }

  return {
    bestTrade,
    worstTrade,
    bestRMultiple,
    longestWinner,
  }
}

async function calculateBenchmarks(positions: Position[]) {
  // Calculate your total return
  const totalInvested = positions.reduce((sum, p) => sum + (p.entry_price * p.shares), 0)
  const totalPnl = positions.reduce((sum, p) => sum + (p.realized_pnl || 0), 0)
  const yourReturn = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

  // Get date range
  const startDate = positions.length > 0 ? new Date(positions[0].entry_date) : new Date()
  const lastExitDate = positions.length > 0 ? positions[positions.length - 1].exit_date : null
  const endDate = lastExitDate ? new Date(lastExitDate) : new Date()

  // Format period
  const period = `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`

  // For now, use simplified benchmark returns
  // In production, you'd fetch actual historical data from a financial API
  const monthsDiff = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const spyReturn = (monthsDiff / 12) * 10 // ~10% annual SPY average
  const qqqReturn = (monthsDiff / 12) * 15 // ~15% annual QQQ average

  return {
    yourReturn: parseFloat(yourReturn.toFixed(2)),
    spyReturn: parseFloat(spyReturn.toFixed(2)),
    qqqReturn: parseFloat(qqqReturn.toFixed(2)),
    outperformanceSpy: parseFloat((yourReturn - spyReturn).toFixed(2)),
    outperformanceQqq: parseFloat((yourReturn - qqqReturn).toFixed(2)),
    period,
  }
}

function generateMilestones(positions: Position[]) {
  const totalTrades = positions.length
  const winningTrades = positions.filter(p => (p.realized_pnl || 0) > 0).length
  const totalPnl = positions.reduce((sum, p) => sum + (p.realized_pnl || 0), 0)
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  const avgWin = winningTrades > 0
    ? positions.filter(p => (p.realized_pnl || 0) > 0).reduce((sum, p) => sum + (p.realized_pnl || 0), 0) / winningTrades
    : 0
  const bestRMultiple = Math.max(...positions.map(p => p.r_multiple || 0), 0)

  const milestones = [
    {
      id: 'first-win',
      title: 'First Victory',
      description: 'Close your first winning trade',
      achieved: winningTrades > 0,
      achievedDate: winningTrades > 0
        ? positions.find(p => (p.realized_pnl || 0) > 0)?.exit_date
        : undefined,
      icon: '🎯',
    },
    {
      id: 'ten-trades',
      title: '10 Trades Club',
      description: 'Complete 10 closed trades',
      achieved: totalTrades >= 10,
      achievedDate: totalTrades >= 10 ? positions[9]?.exit_date : undefined,
      progress: totalTrades,
      target: 10,
      icon: '📊',
    },
    {
      id: 'win-streak-5',
      title: '5-Trade Win Streak',
      description: 'Win 5 trades in a row',
      achieved: hasWinStreak(positions, 5),
      achievedDate: getStreakAchievedDate(positions, 5),
      icon: '🔥',
    },
    {
      id: 'profitable',
      title: 'In The Green',
      description: 'Achieve net positive P&L',
      achieved: totalPnl > 0,
      achievedDate: totalPnl > 0 ? positions.find((_, i) => {
        const pnlUpToHere = positions.slice(0, i + 1).reduce((sum, p) => sum + (p.realized_pnl || 0), 0)
        return pnlUpToHere > 0
      })?.exit_date : undefined,
      icon: '💰',
    },
    {
      id: '1k-profit',
      title: '$1,000 Profit',
      description: 'Earn $1,000 in total P&L',
      achieved: totalPnl >= 1000,
      achievedDate: findPnlMilestoneDate(positions, 1000),
      progress: Math.max(0, Math.floor(totalPnl)),
      target: 1000,
      icon: '💵',
    },
    {
      id: '60-win-rate',
      title: '60% Win Rate',
      description: 'Maintain a 60% or higher win rate',
      achieved: winRate >= 60,
      achievedDate: winRate >= 60 ? positions[Math.ceil(totalTrades * 0.6)]?.exit_date : undefined,
      progress: Math.floor(winRate),
      target: 60,
      icon: '🎲',
    },
    {
      id: 'avg-win-500',
      title: '$500 Average Winner',
      description: 'Achieve $500+ average winning trade',
      achieved: avgWin >= 500,
      achievedDate: avgWin >= 500 ? positions[positions.length - 1]?.exit_date : undefined,
      progress: Math.floor(avgWin),
      target: 500,
      icon: '📈',
    },
    {
      id: '5r-winner',
      title: '5R Winner',
      description: 'Close a trade with 5R or better',
      achieved: bestRMultiple >= 5,
      achievedDate: bestRMultiple >= 5
        ? positions.find(p => (p.r_multiple || 0) >= 5)?.exit_date
        : undefined,
      icon: '🚀',
    },
    {
      id: '100-trades',
      title: 'Century Club',
      description: 'Complete 100 closed trades',
      achieved: totalTrades >= 100,
      achievedDate: totalTrades >= 100 ? positions[99]?.exit_date : undefined,
      progress: totalTrades,
      target: 100,
      icon: '💯',
    },
  ]

  return milestones
}

function hasWinStreak(positions: Position[], streakLength: number): boolean {
  let currentStreak = 0
  for (const position of positions) {
    if ((position.realized_pnl || 0) > 0) {
      currentStreak++
      if (currentStreak >= streakLength) return true
    } else {
      currentStreak = 0
    }
  }
  return false
}

function getStreakAchievedDate(positions: Position[], streakLength: number): string | undefined {
  let currentStreak = 0
  for (let i = 0; i < positions.length; i++) {
    if ((positions[i].realized_pnl || 0) > 0) {
      currentStreak++
      if (currentStreak >= streakLength) {
        return positions[i].exit_date || undefined
      }
    } else {
      currentStreak = 0
    }
  }
  return undefined
}

function findPnlMilestoneDate(positions: Position[], targetPnl: number): string | undefined {
  let cumulativePnl = 0
  for (const position of positions) {
    cumulativePnl += position.realized_pnl || 0
    if (cumulativePnl >= targetPnl) {
      return position.exit_date || undefined
    }
  }
  return undefined
}
