// Adapter to map the existing `trading_positions` + `position_events` schema
// into the SSOT canonical Trading Ledger types.
//
// This is a non-breaking bridge used during refactor Phase 1.

import type { Position, PositionEvent, PositionLeg, PositionSource, PositionStatus } from '../types'

const DEFAULT_CURRENCY = 'USD'
const DEFAULT_MULTIPLIER = 100

function normalizeStatus(status: any): PositionStatus {
  // Existing schema uses: entered/scaling/trimming/closed
  if (status === 'closed') return 'closed'
  return 'open'
}

function normalizeSource(createdBy: any): PositionSource {
  // Existing code uses created_by like 'admin' | 'dev_seed' | email.
  // v1 default: treat as manual unless explicitly marked.
  return 'manual'
}

export function mapTradingPositionRowToCanonical(row: any): Position {
  const underlying = row?.ticker ?? row?.symbol ?? row?.underlying ?? null
  return {
    id: String(row.id),
    owner_type: 'admin',
    owner_id: null,
    asset_type: (row?.asset_type || 'stock') === 'option' ? 'option' : 'stock',
    underlying_symbol: String(underlying || ''),
    direction: row?.direction === 'short' ? 'short' : 'long',
    currency: DEFAULT_CURRENCY,
    status: normalizeStatus(row?.status),
    opened_at: row?.entry_date || row?.created_at || new Date().toISOString(),
    closed_at: row?.exit_date || row?.closed_at || null,
    source: normalizeSource(row?.created_by),

    entry_price: row?.entry_price ?? null,
    exit_price: row?.exit_price ?? null,
    shares: row?.shares_contracts ?? null,

    stop_loss: row?.stop_loss ?? null,
    target_1: row?.target_1 ?? null,
    target_2: row?.target_2 ?? null,
    target_3: row?.target_3 ?? null,

    thesis: row?.thesis ?? null,
    tags: Array.isArray(row?.tags) ? row.tags : [],
    notes: row?.notes ?? null,
  }
}

export function mapPositionEventRowToCanonical(row: any): PositionEvent {
  // Existing event_type values include 'entered' etc.
  const typeMap: Record<string, PositionEvent['type']> = {
    entered: 'position.opened',
    closed: 'position.closed',
    amended: 'position.amended',
    stop_set: 'position.stop_set',
    target_set: 'position.target_set',
    stop_hit: 'position.stop_hit',
    target_hit: 'position.target_hit',
    'position.opened': 'position.opened',
    'position.closed': 'position.closed',
    'position.amended': 'position.amended',
    'position.stop_set': 'position.stop_set',
    'position.target_set': 'position.target_set',
    'position.stop_hit': 'position.stop_hit',
    'position.target_hit': 'position.target_hit',
  }
  const mapped = typeMap[String(row?.event_type || '')] || 'position.amended'

  return {
    id: row?.id,
    position_id: String(row?.position_id),
    type: mapped,
    occurred_at: row?.event_date || row?.created_at || new Date().toISOString(),
    amendment_class: row?.amendment_class || undefined,
    diff_summary: row?.diff_summary || null,
    reason: row?.note || null,
    actor_email: row?.created_by || null,
  }
}

export function mapOptionLegRowToCanonical(row: any): PositionLeg {
  return {
    id: row?.id,
    position_id: row?.position_id,
    underlying_symbol: row?.underlying_symbol,
    type: row?.type,
    side: row?.side,
    strike: Number(row?.strike),
    expiry: String(row?.expiry),
    contracts: Number(row?.contracts),
    entry_premium: Number(row?.entry_premium),
    exit_premium: row?.exit_premium ?? null,
    multiplier: Number(row?.multiplier ?? DEFAULT_MULTIPLIER),
  }
}
