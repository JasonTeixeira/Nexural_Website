import { NextRequest, NextResponse } from 'next/server'
import { algoTradingGamification } from '@/lib/gamification/algo-trading-gamification'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    
    // Get leaderboard
    const leaderboard = await algoTradingGamification.getLeaderboard(limit)
    
    return NextResponse.json({
      success: true,
      leaderboard,
      total: leaderboard.length
    })
    
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    )
  }
}
