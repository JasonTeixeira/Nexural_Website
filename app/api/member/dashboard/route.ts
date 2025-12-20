import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('members')
      .select('*')
      .eq('id', decoded.id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check subscription status
    if (user.subscription_status !== 'active' && user.subscription_status !== 'trial') {
      return NextResponse.json(
        { error: 'Subscription not active' },
        { status: 403 }
      )
    }

    // Get all signals from signals table
    const { data: allSignals, error: allSignalsError } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })

    // Get recent signals for display
    const { data: recentSignalsData, error: signalsError } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    const recentSignals = recentSignalsData?.map(signal => ({
      id: signal.id,
      symbol: signal.symbol,
      direction: signal.direction,
      entry: signal.entry_price,
      timestamp: formatTimeAgo(new Date(signal.created_at)),
      status: signal.status || 'active',
      pnl: signal.pnl
    })) || []

    // Calculate real performance stats from all signals
    const calculateStats = (signals: any[]) => {
      if (!signals || signals.length === 0) {
        return {
          totalSignals: 0,
          winRate: 0,
          totalReturn: 0,
          monthlyReturn: 0,
          signalsToday: 0,
          lastSignalTime: 'No signals yet',
          activeSubscription: user.subscription_tier || 'Basic'
        }
      }

      // Calculate win rate from closed signals
      const closedSignals = signals.filter(s => s.status === 'closed' || s.status === 'stopped')
      const winningSignals = closedSignals.filter(s => s.pnl && s.pnl > 0)
      const winRate = closedSignals.length > 0 ? Math.round((winningSignals.length / closedSignals.length) * 100) : 0

      // Calculate total return from P&L
      const totalPnL = closedSignals.reduce((sum, signal) => sum + (signal.pnl || 0), 0)
      const totalReturn = Math.round((totalPnL / 10000) * 100) / 100 // Assuming $10k starting capital

      // Calculate monthly return (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const monthlySignals = signals.filter(s => new Date(s.created_at) >= thirtyDaysAgo)
      const monthlyPnL = monthlySignals.reduce((sum, signal) => sum + (signal.pnl || 0), 0)
      const monthlyReturn = Math.round((monthlyPnL / 10000) * 100) / 100

      // Signals today
      const today = new Date().toDateString()
      const signalsToday = signals.filter(s => 
        new Date(s.created_at).toDateString() === today
      ).length

      // Last signal time
      const lastSignalTime = signals.length > 0 ? 
        formatTimeAgo(new Date(signals[0].created_at)) : 
        'No signals yet'

      return {
        totalSignals: signals.length,
        winRate,
        totalReturn,
        monthlyReturn,
        signalsToday,
        lastSignalTime,
        activeSubscription: user.subscription_tier || 'Premium'
      }
    }

    const stats = calculateStats(allSignals || [])

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscription_status,
        subscriptionTier: user.subscription_tier
      },
      stats,
      recentSignals
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}
