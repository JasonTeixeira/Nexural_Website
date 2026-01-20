// Canonical Trading Ledger repository interface.
// This layer enforces SSOT shape regardless of underlying DB table(s).

import type { Position, PositionEvent } from './types'

export interface TradingLedgerRepository {
  /**
   * List positions for admin publishing / member views.
   */
  listPositions(params?: {
    owner_type?: 'admin' | 'member'
    status?: 'open' | 'closed' | 'all'
    limit?: number
  }): Promise<{ positions: Position[] }>

  /**
   * Fetch a position (canonical shape).
   * For admin positions, this reads from `trading_positions` during Phase 1.
   */
  getPositionById(id: string): Promise<{ position: Position; events: PositionEvent[] }>
}
