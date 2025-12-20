import { NextRequest, NextResponse } from 'next/server'
import { algoTradingReferralSystem } from '@/lib/algo-trading-referral-system'
import { algoTradingGamification } from '@/lib/algo-trading-gamification'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const {
      memberId,
      email,
      name,
      tradingExperience,
      currentBroker,
      interestedFeatures,
      willingToBeta,
      referralCode
    } = body
    
    // Validate required fields
    if (!memberId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Join waitlist
    const result = await algoTradingReferralSystem.joinWaitlist({
      memberId,
      email,
      name,
      tradingExperience,
      currentBroker,
      interestedFeatures,
      willingToBeta,
      referralCode
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || result.message },
        { status: 400 }
      )
    }
    
    // Get gamification stats
    const stats = await algoTradingGamification.getGamificationStats(memberId)
    
    return NextResponse.json({
      success: true,
      position: result.position,
      referralCode: result.referralCode,
      message: result.message,
      stats
    })
    
  } catch (error) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
