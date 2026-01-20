import { createClient } from '@/lib/supabase/server'
import type { Position, PositionEvent } from './types'
import type { TradingLedgerRepository } from './repository'
import { mapMemberPositionRowToCanonical } from './adapters/member-positions-adapter'

/**
 * Phase 1 member repository: uses existing member `positions` table
 * and maps rows to SSOT canonical types.
 *
 * Note: member-side events are not yet stored as an event spine in this schema.
 * Sprint 3 will migrate member views toward the canonical event spine.
 */
export class MemberPositionsLedgerRepository implements TradingLedgerRepository {
  async listPositions(params?: {
    owner_type?: 'admin' | 'member'
    status?: 'open' | 'closed' | 'all'
    limit?: number
    user_id?: string
  }): Promise<{ positions: Position[] }> {
    const supabase = await createClient()
    const status = params?.status || 'all'
    const limit = Math.min(Math.max(params?.limit ?? 500, 1), 1000)

    if (!params?.user_id) {
      throw new Error('user_id is required for member positions')
    }

    let q = supabase
      .from('positions')
      .select('*')
      .eq('user_id', params.user_id)
      .order('entry_date', { ascending: false })

    if (status !== 'all') {
      q = q.eq('status', status)
    }

    const { data, error } = await q.limit(limit)
    if (error) throw error

    return { positions: (data || []).map(mapMemberPositionRowToCanonical) }
  }

  async getPositionById(id: string): Promise<{ position: Position; events: PositionEvent[] }> {
    const supabase = await createClient()
    const { data, error } = await supabase.from('positions').select('*').eq('id', id).single()
    if (error || !data) throw new Error('Position not found')

    return { position: mapMemberPositionRowToCanonical(data), events: [] }
  }
}

