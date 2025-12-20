import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { positionIds, exitPrice } = body

    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      return NextResponse.json(
        { error: 'Position IDs are required' },
        { status: 400 }
      )
    }

    // Fetch all positions to close
    const { data: positions, error: fetchError } = await supabase
      .from('positions')
      .select('*')
      .in('id', positionIds)
      .eq('status', 'open')

    if (fetchError) {
      console.error('Error fetching positions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch positions' },
        { status: 500 }
      )
    }

    if (!positions || positions.length === 0) {
      return NextResponse.json(
        { error: 'No open positions found to close' },
        { status: 404 }
      )
    }

    // Calculate P&L for each position
    const updates = positions.map((position) => {
      const exit = exitPrice || position.current_price || position.entry_price
      const quantity = position.quantity || 1
      const entryPrice = position.entry_price || 0
      
      // Calculate realized P&L
      const realizedPnL = (exit - entryPrice) * quantity
      const realizedPnLPct = entryPrice > 0 ? ((exit - entryPrice) / entryPrice) * 100 : 0
      
      // Calculate R-multiple if stop loss is set
      let rMultiple = null
      if (position.stop_loss && position.entry_price) {
        const riskPerShare = Math.abs(position.entry_price - position.stop_loss)
        const profitPerShare = exit - position.entry_price
        rMultiple = riskPerShare > 0 ? profitPerShare / riskPerShare : 0
      }

      // Calculate hold days
      const entryDate = position.entry_date ? new Date(position.entry_date) : new Date()
      const exitDate = new Date()
      const holdDays = Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: position.id,
        status: 'closed',
        exit_price: exit,
        exit_date: exitDate.toISOString(),
        realized_pnl: realizedPnL,
        realized_pnl_pct: realizedPnLPct,
        actual_r_multiple: rMultiple,
        actual_hold_days: holdDays,
        updated_at: new Date().toISOString(),
      }
    })

    // Perform bulk update
    const { error: updateError } = await supabase
      .from('positions')
      .upsert(updates)

    if (updateError) {
      console.error('Error updating positions:', updateError)
      return NextResponse.json(
        { error: 'Failed to close positions', details: updateError.message },
        { status: 500 }
      )
    }

    // Return success with updated count
    return NextResponse.json({
      success: true,
      message: `Successfully closed ${updates.length} position(s)`,
      count: updates.length,
      positions: updates.map(u => ({
        id: u.id,
        exit_price: u.exit_price,
        realized_pnl: u.realized_pnl,
      })),
    })
  } catch (error) {
    console.error('Bulk close error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
