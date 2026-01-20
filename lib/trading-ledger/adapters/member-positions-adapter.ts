// Adapter to map the existing member `positions` schema
// into the SSOT canonical Trading Ledger types.

import type { Position, PositionSource, PositionStatus } from '../types'

const DEFAULT_CURRENCY = 'USD'

function normalizeStatus(status: any): PositionStatus {
  if (status === 'closed') return 'closed'
  return 'open'
}

function normalizeSource(row: any): PositionSource {
  // Member positions are manual unless explicitly imported/backfilled.
  return (row?.source as PositionSource) || 'manual'
}

export function mapMemberPositionRowToCanonical(row: any): Position {
  const symbol = row?.symbol ?? row?.ticker ?? row?.underlying ?? ''
  const openedAt = row?.opened_at ?? row?.entry_date ?? row?.created_at ?? new Date().toISOString()
  const closedAt = row?.closed_at ?? row?.exit_date ?? row?.closed_at ?? null

  return {
    id: String(row.id),
    owner_type: 'member',
    owner_id: row?.user_id ?? null,
    asset_type: (row?.type || row?.asset_type || 'stock') === 'option' ? 'option' : 'stock',
    underlying_symbol: String(symbol),
    direction: row?.direction === 'short' ? 'short' : 'long',
    currency: DEFAULT_CURRENCY,
    status: normalizeStatus(row?.status),
    opened_at: openedAt,
    closed_at: closedAt,
    source: normalizeSource(row),

    entry_price: row?.entry_price ?? null,
    exit_price: row?.exit_price ?? null,
    shares: row?.quantity ?? row?.shares ?? null,

    stop_loss: row?.stop_loss ?? null,
    target_1: row?.target ?? row?.take_profit ?? null,

    thesis: row?.thesis ?? null,
    tags: Array.isArray(row?.tags) ? row.tags : [],
    notes: row?.notes ?? null,
  }
}

