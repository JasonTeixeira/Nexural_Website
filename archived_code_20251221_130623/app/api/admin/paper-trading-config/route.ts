// ADMIN API: PAPER TRADING CONFIGURATION
// Manage which strategies execute paper trades
// Discord signals ALWAYS sent, paper trading is SELECTIVE

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// GET: Fetch all paper trading configurations
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all configurations with status
    const { data, error } = await supabase
      .from('paper_trading_status')
      .select('*')

    if (error) throw error

    return NextResponse.json({
      success: true,
      configs: data || []
    })

  } catch (error) {
    console.error('❌ Error fetching paper trading config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configurations' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Update paper trading configuration
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { strategy_name, enabled, max_positions, max_daily_trades, risk_per_trade, max_daily_loss, notes } = body

    // Validate and check required fields
    if (!strategy_name || typeof strategy_name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid strategy name is required' },
        { status: 400 }
      )
    }

    // Validate enabled field
    if (enabled !== undefined && typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled must be a boolean' },
        { status: 400 }
      )
    }

    // Validate max_positions
    if (max_positions !== undefined && (typeof max_positions !== 'number' || max_positions < 0)) {
      return NextResponse.json(
        { success: false, error: 'max_positions must be a non-negative number' },
        { status: 400 }
      )
    }

    // Validate max_daily_trades
    if (max_daily_trades !== undefined && (typeof max_daily_trades !== 'number' || max_daily_trades < 0)) {
      return NextResponse.json(
        { success: false, error: 'max_daily_trades must be a non-negative number' },
        { status: 400 }
      )
    }

    // Validate risk_per_trade
    if (risk_per_trade !== undefined && (typeof risk_per_trade !== 'number' || risk_per_trade <= 0 || risk_per_trade > 100)) {
      return NextResponse.json(
        { success: false, error: 'risk_per_trade must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Validate max_daily_loss
    if (max_daily_loss !== undefined && (typeof max_daily_loss !== 'number' || max_daily_loss <= 0)) {
      return NextResponse.json(
        { success: false, error: 'max_daily_loss must be a positive number' },
        { status: 400 }
      )
    }

    // Update configuration
    const { data, error } = await supabase
      .from('paper_trading_config')
      .update({
        enabled: enabled !== undefined ? enabled : undefined,
        max_positions: max_positions !== undefined ? max_positions : undefined,
        max_daily_trades: max_daily_trades !== undefined ? max_daily_trades : undefined,
        risk_per_trade: risk_per_trade !== undefined ? risk_per_trade : undefined,
        max_daily_loss: max_daily_loss !== undefined ? max_daily_loss : undefined,
        notes: notes !== undefined ? notes : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('strategy_name', strategy_name)
      .select()
      .single()

    if (error) throw error

    console.log(`✅ Updated paper trading config for ${strategy_name}`)
    console.log(`   Enabled: ${enabled}`)
    console.log(`   Max Positions: ${max_positions}`)
    console.log(`   Risk Per Trade: ${risk_per_trade}`)

    return NextResponse.json({
      success: true,
      message: `Configuration updated for ${strategy_name}`,
      config: data
    })

  } catch (error) {
    console.error('❌ Error updating paper trading config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT: Bulk update multiple strategies
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates must be an array' },
        { status: 400 }
      )
    }

    const results = []

    for (const update of updates) {
      const { strategy_name, ...fields } = update

      if (!strategy_name) continue

      const { data, error } = await supabase
        .from('paper_trading_config')
        .update({
          ...fields,
          updated_at: new Date().toISOString()
        })
        .eq('strategy_name', strategy_name)
        .select()
        .single()

      if (error) {
        console.error(`❌ Error updating ${strategy_name}:`, error)
        results.push({ strategy_name, success: false, error: error.message })
      } else {
        results.push({ strategy_name, success: true, data })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk update completed`,
      results
    })

  } catch (error) {
    console.error('❌ Error in bulk update:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk update' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE: Reset daily counters (called at midnight)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Reset daily counters
    const { error } = await supabase.rpc('reset_daily_paper_counters')

    if (error) throw error

    console.log('✅ Daily paper trading counters reset')

    return NextResponse.json({
      success: true,
      message: 'Daily counters reset successfully'
    })

  } catch (error) {
    console.error('❌ Error resetting daily counters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset daily counters' },
      { status: 500 }
    )
  }
}
