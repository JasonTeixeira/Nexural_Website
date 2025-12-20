import { NextRequest, NextResponse } from 'next/server'
import { algoTradingReferralSystem } from '@/lib/algo-trading-referral-system'
import { algoTradingGamification } from '@/lib/algo-trading-gamification'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get('memberId')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      )
    }
    
    // Get referral stats
    const referralStats = await algoTradingReferralSystem.getReferralStats(memberId)
    
    // Get gamification stats
    const gamificationStats = await algoTradingGamification.getGamificationStats(memberId)
    
    // Get activity history
    const activityHistory = await algoTradingGamification.getActivityHistory(memberId, 20)
    
    return NextResponse.json({
      success: true,
      referral: referralStats,
      gamification: gamificationStats,
      recentActivity: activityHistory
    })
    
  } catch (error) {
    console.error('Error getting waitlist stats:', error)
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
