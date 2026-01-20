// Canonical Trading Ledger types (SSOT)
// Source of truth: /docs/TRADING_LEDGER_SPEC.md

export type OwnerType = 'admin' | 'member'

export type AssetType = 'stock' | 'option'

export type Direction = 'long' | 'short'

export type PositionStatus = 'open' | 'closed'

export type PositionSource = 'manual' | 'import' | 'backfill'

export type OptionType = 'call' | 'put'
export type OptionSide = 'buy' | 'sell'

export type AmendmentClass = 'economic' | 'non_economic'

export interface PositionLeg {
  id?: string
  position_id?: string
  underlying_symbol: string
  type: OptionType
  side: OptionSide
  strike: number
  expiry: string // ISO date
  contracts: number
  entry_premium: number
  exit_premium?: number | null
  multiplier: number // default 100
}

export interface Position {
  id: string
  owner_id?: string | null
  owner_type: OwnerType
  asset_type: AssetType
  underlying_symbol: string
  direction: Direction
  currency: string // default USD
  status: PositionStatus
  opened_at: string
  closed_at?: string | null
  source: PositionSource

  // Stock fields (if asset_type=stock)
  entry_price?: number | null
  exit_price?: number | null
  shares?: number | null

  // Option fields (if asset_type=option)
  legs?: PositionLeg[]

  // Plan/risk
  stop_loss?: number | null
  target_1?: number | null
  target_2?: number | null
  target_3?: number | null

  // Metadata
  thesis?: string | null
  tags?: string[]
  notes?: string | null
}

export interface PositionEvent {
  id?: string
  position_id: string
  type:
    | 'position.opened'
    | 'position.closed'
    | 'position.stop_set'
    | 'position.target_set'
    | 'position.stop_hit'
    | 'position.target_hit'
    | 'position.amended'
    | 'position.image_added'
    | 'position.comment_added'
    | 'position.comment_liked'
    | 'journal.entry_added'
    | 'journal.entry_amended'
  occurred_at: string

  // Optional payload for amendments
  amendment_class?: AmendmentClass
  diff_summary?: string | null
  reason?: string | null

  // Actor
  actor_id?: string | null
  actor_email?: string | null
}

