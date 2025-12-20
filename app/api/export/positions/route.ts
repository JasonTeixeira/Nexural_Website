import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

/**
 * Export positions to CSV
 * 
 * Query parameters:
 * - status: open | closed | all (default: all)
 * - timeframe: swing | day | position | all (default: all)
 * - format: csv | json (default: csv)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const timeframe = searchParams.get('timeframe') || 'all'
    const format = searchParams.get('format') || 'csv'

    const supabase = createClient()

    // Build query
    let query = supabase
      .from('positions')
      .select('*')
      .order('entry_date', { ascending: false })

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (timeframe !== 'all') {
      query = query.eq('time_frame', timeframe)
    }

    const { data: positions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!positions || positions.length === 0) {
      return NextResponse.json({ error: 'No positions found' }, { status: 404 })
    }

    // JSON format
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        count: positions.length,
        positions,
        exportedAt: new Date().toISOString(),
      })
    }

    // CSV format
    const csvHeaders = [
      'Ticker',
      'Company Name',
      'Status',
      'Timeframe',
      'Entry Date',
      'Exit Date',
      'Entry Price',
      'Exit Price',
      'Current Price',
      'Shares',
      'Position Value',
      'Stop Loss',
      'Target',
      'Setup Type',
      'Sector',
      'Realized P&L',
      'Realized P&L %',
      'Unrealized P&L',
      'Unrealized P&L %',
      'Risk $',
      'Risk %',
      'R-Multiple',
      'Hold Days',
      'Trade Grade',
      'Entry Thesis',
      'Exit Reason',
    ]

    const csvRows = positions.map((pos) => [
      pos.ticker || '',
      pos.company_name || '',
      pos.status || '',
      pos.time_frame || '',
      pos.entry_date || '',
      pos.exit_date || '',
      pos.entry_price || '',
      pos.exit_price || '',
      pos.current_price || '',
      pos.shares || '',
      pos.position_value || '',
      pos.stop_loss || '',
      pos.target || '',
      pos.setup_type || '',
      pos.sector || '',
      pos.realized_pnl || '',
      pos.realized_pnl_pct || '',
      pos.unrealized_pnl || '',
      pos.unrealized_pnl_pct || '',
      pos.risk_dollars || '',
      pos.risk_percent || '',
      pos.actual_r_multiple || '',
      pos.actual_hold_days || '',
      pos.trade_grade || '',
      (pos.entry_thesis || '').replace(/"/g, '""').replace(/\n/g, ' '),
      (pos.exit_reason || '').replace(/"/g, '""').replace(/\n/g, ' '),
    ])

    // Build CSV string
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      ),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="positions-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      {
        error: 'Export failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
