import { NextRequest, NextResponse } from 'next/server'
import { emitDeletionGateHit } from '@/lib/deletion-gate'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/member/signals
 * Fetch signals for member portal
 * Supports filtering by status and searching by symbol
 */
export async function GET(request: NextRequest) {
  emitDeletionGateHit('legacy.api.member.signals', { method: 'GET' })
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, closed, all
    const search = searchParams.get('search') // symbol search
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query
    let query = supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Search by symbol if provided
    if (search) {
      query = query.ilike('symbol', `%${search}%`)
    }

    const { data: signals, error } = await query

    if (error) {
      console.error('Error fetching signals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch signals' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total: signals?.length || 0,
      active: signals?.filter(s => s.status === 'active').length || 0,
      closed: signals?.filter(s => s.status === 'closed').length || 0,
      stoppedOut: signals?.filter(s => s.status === 'stopped').length || 0
    }

    // Calculate win rate from closed signals
    const closedSignals = signals?.filter(s => s.status === 'closed' || s.status === 'stopped') || []
    const winningSignals = closedSignals.filter(s => s.pnl && s.pnl > 0)
    const winRate = closedSignals.length > 0 
      ? Math.round((winningSignals.length / closedSignals.length) * 100) 
      : 0

    // Calculate total P&L
    const totalPnL = closedSignals.reduce((sum, signal) => sum + (signal.pnl || 0), 0)

    return NextResponse.json({
      success: true,
      signals: signals || [],
      stats: {
        ...stats,
        winRate,
        totalPnL: parseFloat(totalPnL.toFixed(2))
      }
    })

  } catch (error) {
    console.error('Error in member signals API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
