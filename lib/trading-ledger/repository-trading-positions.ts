import { createClient } from '@/lib/supabase/server'
import type { TradingLedgerRepository } from './repository'
import type { Position, PositionEvent } from './types'
import {
  mapPositionEventRowToCanonical,
  mapTradingPositionRowToCanonical,
} from './adapters/trading-positions-adapter'

/**
 * Phase 1 repository: uses existing `trading_positions` + `position_events` tables
 * and maps them to the SSOT canonical types.
 */
export class TradingPositionsLedgerRepository implements TradingLedgerRepository {
  async listPositions(params?: {
    owner_type?: 'admin' | 'member'
    status?: 'open' | 'closed' | 'all'
    limit?: number
  }): Promise<{ positions: Position[] }> {
    // Phase 1: only supports admin positions from `trading_positions`.
    const supabase = await createClient()
    const status = params?.status || 'all'
    const limit = Math.min(Math.max(params?.limit ?? 100, 1), 500)

    let q = supabase.from('trading_positions').select('*')

    if (status !== 'all') {
      if (status === 'open') q = q.in('status', ['entered', 'scaling', 'trimming'])
      else q = q.eq('status', 'closed')
    }

    const { data, error } = await q.order('entry_date', { ascending: false }).limit(limit)
    if (error) throw error

    return { positions: (data || []).map(mapTradingPositionRowToCanonical) }
  }

  async getPositionById(
    id: string
  ): Promise<{ position: Position; events: PositionEvent[] }> {
    const supabase = await createClient()

    const { data: row, error: posErr } = await supabase
      .from('trading_positions')
      .select('*')
      .eq('id', id)
      .single()

    if (posErr || !row) {
      throw new Error('Position not found')
    }

    const { data: evRows, error: evErr } = await supabase
      .from('position_events')
      .select('*')
      .eq('position_id', id)
      .order('event_date', { ascending: false })

    if (evErr) {
      // Keep behavior non-breaking: return position even if events fail.
      return { position: mapTradingPositionRowToCanonical(row), events: [] }
    }

    return {
      position: mapTradingPositionRowToCanonical(row),
      events: (evRows || []).map(mapPositionEventRowToCanonical),
    }
  }
}
