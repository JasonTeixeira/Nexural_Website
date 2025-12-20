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
      .select('id, subscription_status')
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for swing_positions table
    let query = supabase
      .from('swing_positions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by status if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: positions, error: positionsError } = await query

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return NextResponse.json(
        { error: 'Failed to fetch positions' },
        { status: 500 }
      )
    }

    // Calculate P&L for each position
    const positionsWithPnL = positions?.map(position => {
      let pnl = 0
      let pnlPercentage = 0

      if (position.exit_price && position.entry_price) {
        // Calculate realized P&L
        if (position.direction === 'long') {
          pnl = (position.exit_price - position.entry_price) * (position.size || 1)
          pnlPercentage = ((position.exit_price - position.entry_price) / position.entry_price) * 100
        } else {
          pnl = (position.entry_price - position.exit_price) * (position.size || 1)
          pnlPercentage = ((position.entry_price - position.exit_price) / position.entry_price) * 100
        }
      } else if (position.current_price && position.entry_price) {
        // Calculate unrealized P&L for open positions
        if (position.direction === 'long') {
          pnl = (position.current_price - position.entry_price) * (position.size || 1)
          pnlPercentage = ((position.current_price - position.entry_price) / position.entry_price) * 100
        } else {
          pnl = (position.entry_price - position.current_price) * (position.size || 1)
          pnlPercentage = ((position.entry_price - position.current_price) / position.entry_price) * 100
        }
      }

      return {
        ...position,
        pnl: Math.round(pnl * 100) / 100,
        pnl_percentage: Math.round(pnlPercentage * 100) / 100,
        is_profitable: pnl > 0
      }
    }) || []

    // Calculate summary statistics
    const summary = {
      total: positionsWithPnL.length,
      open: positionsWithPnL.filter(p => p.status === 'open').length,
      closed: positionsWithPnL.filter(p => p.status === 'closed').length,
      total_pnl: positionsWithPnL.reduce((sum, p) => sum + (p.pnl || 0), 0),
      winning_positions: positionsWithPnL.filter(p => p.pnl && p.pnl > 0).length,
      losing_positions: positionsWithPnL.filter(p => p.pnl && p.pnl < 0).length
    }

    return NextResponse.json({
      positions: positionsWithPnL,
      summary: {
        ...summary,
        win_rate: summary.closed > 0 
          ? Math.round((summary.winning_positions / summary.closed) * 100 * 10) / 10 
          : 0,
        total_pnl: Math.round(summary.total_pnl * 100) / 100
      }
    })

  } catch (error) {
    console.error('Positions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
