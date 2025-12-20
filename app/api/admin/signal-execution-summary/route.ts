// ADMIN API: SIGNAL EXECUTION SUMMARY
// View Discord vs Paper Trading execution rates
// Perfect for ML training data analysis

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// GET: Fetch signal execution summary
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const strategy = searchParams.get('strategy')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Get execution summary by strategy
    const { data: summary, error: summaryError } = await supabase
      .from('signal_execution_summary')
      .select('*')

    if (summaryError) throw summaryError

    // Get recent signal execution log
    let query = supabase
      .from('signal_execution_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (strategy) {
      query = query.eq('strategy', strategy)
    }

    const { data: recentSignals, error: signalsError } = await query

    if (signalsError) throw signalsError

    // Get ML training data view
    const { data: mlData, error: mlError } = await supabase
      .from('ml_training_data')
      .select('*')
      .order('signal_time', { ascending: false })
      .limit(limit)

    if (mlError) throw mlError

    // Calculate overall stats
    const totalSignals = recentSignals?.length || 0
    const discordSent = recentSignals?.filter(s => s.discord_sent).length || 0
    const paperExecuted = recentSignals?.filter(s => s.paper_trading_executed).length || 0
    const paperSkipped = recentSignals?.filter(s => s.paper_trading_enabled && !s.paper_trading_executed).length || 0

    return NextResponse.json({
      success: true,
      summary: {
        by_strategy: summary || [],
        overall: {
          total_signals: totalSignals,
          discord_sent: discordSent,
          discord_rate: totalSignals > 0 ? (discordSent / totalSignals * 100).toFixed(2) : 0,
          paper_executed: paperExecuted,
          paper_execution_rate: totalSignals > 0 ? (paperExecuted / totalSignals * 100).toFixed(2) : 0,
          paper_skipped: paperSkipped
        },
        recent_signals: recentSignals || [],
        ml_training_data: mlData || []
      }
    })

  } catch (error) {
    console.error('❌ Error fetching signal execution summary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Export ML training data
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { start_date, end_date, strategies, format = 'json' } = body

    // Build query
    let query = supabase
      .from('ml_training_data')
      .select('*')
      .order('signal_time', { ascending: false })

    if (start_date) {
      query = query.gte('signal_time', start_date)
    }

    if (end_date) {
      query = query.lte('signal_time', end_date)
    }

    if (strategies && Array.isArray(strategies) && strategies.length > 0) {
      query = query.in('strategy', strategies)
    }

    const { data, error } = await query

    if (error) throw error

    // Format data based on request
    if (format === 'csv') {
      // Convert to CSV
      if (!data || data.length === 0) {
        return NextResponse.json({
          success: true,
          data: '',
          format: 'csv',
          count: 0
        })
      }

      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      )
      const csv = [headers, ...rows].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ml_training_data_${Date.now()}.csv"`
        }
      })
    }

    // Return JSON
    return NextResponse.json({
      success: true,
      data: data || [],
      format: 'json',
      count: data?.length || 0,
      metadata: {
        start_date,
        end_date,
        strategies,
        exported_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error exporting ML training data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
