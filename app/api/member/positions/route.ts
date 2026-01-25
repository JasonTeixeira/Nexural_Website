import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { requireSupabaseUser } from '@/lib/auth/server-helpers'
import { enforceMemberEntitlement } from '@/lib/entitlements-api'
import { createClient } from '@/lib/supabase/server'
import { MemberPositionsLedgerRepository } from '@/lib/trading-ledger/repository-member-positions'
import type { AmendmentClass } from '@/lib/trading-ledger/types'
import { CacheTTL, CacheKeys, CacheService } from '@/lib/cache-service'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSupabaseUser()
    if (auth.response) return auth.response

    const entitlementResp = await enforceMemberEntitlement()
    if (entitlementResp) return entitlementResp

    const supabase = await createClient()

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('members')
      .select('id, subscription_status')
      .eq('id', auth.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check subscription status
    if (user.subscription_status !== 'active' && user.subscription_status !== 'trial') {
      return NextResponse.json(
        { error: 'Subscription not active' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50'), 1), 500)

    const repo = new MemberPositionsLedgerRepository()
    const repoStatus = (status === 'all' ? 'all' : (status as any))

    // Cache per-user, per-filter list for snappy member portal.
    // TTL is short because positions can change; we invalidate on writes below.
    const cacheKey = `${CacheKeys.positions(auth.user.id)}:${repoStatus}:${limit}`
    const cached = await CacheService.get<any>(cacheKey)
    const positions = cached?.positions
      ? (cached.positions as any[])
      : (
          await repo.listPositions({
            owner_type: 'member',
            user_id: auth.user.id,
            status: repoStatus,
            limit,
          })
        ).positions

    if (!cached) {
      await CacheService.set(cacheKey, { positions }, CacheTTL.SHORT)
    }

    // Privacy-by-default (SSOT): only return the authenticated user's positions.
    // (Enforced by user_id filter above.)

    return NextResponse.json(
      {
      positions,
      summary: {
        total: positions.length,
        open: positions.filter((p) => p.status === 'open').length,
        closed: positions.filter((p) => p.status === 'closed').length,
      },
      },
      {
        headers: {
          'X-Cache': cached ? 'HIT' : 'MISS',
          'X-Cache-Key': cacheKey,
        },
      }
    )

  } catch (error) {
    console.error('Positions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSupabaseUser()
    if (auth.response) return auth.response

    const entitlementResp = await enforceMemberEntitlement()
    if (entitlementResp) return entitlementResp

    const supabase = await createClient()

    const body = await request.json()

    // SSOT: member positions are private-by-default.
    // This schema uses `positions` legacy table during Phase 1.
    const now = new Date().toISOString()
    const symbol = String(body.symbol || '').toUpperCase()
    if (!symbol) {
      return NextResponse.json({ error: 'symbol is required' }, { status: 400 })
    }

    const entryPrice = Number(body.entry_price)
    if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
      return NextResponse.json({ error: 'entry_price must be a positive number' }, { status: 400 })
    }

    const quantity = Number(body.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'quantity must be a positive number' }, { status: 400 })
    }

    const row: any = {
      user_id: auth.user.id,
      symbol,
      status: 'open',
      direction: body.direction === 'short' ? 'short' : 'long',
      entry_price: entryPrice,
      current_price: entryPrice,
      quantity,
      opened_at: body.opened_at || body.entry_date || now,
      // privacy-by-default
      is_public: false,
      notes: body.notes || null,
      stop_loss: body.stop_loss ?? null,
      target: body.target_1 ?? body.take_profit ?? null,
    }

    const { data, error } = await supabase.from('positions').insert(row).select('*').single()
    if (error) {
      console.error('Error creating member position:', error)
      return NextResponse.json({ error: 'Failed to create position' }, { status: 500 })
    }

    // SSOT event spine: emit position.opened for member positions
    // Source of truth: docs/EVENT_TAXONOMY.md + docs/TRADING_LEDGER_SPEC.md
    await supabase.from('position_events').insert({
      position_id: data.id,
      event_type: 'position.opened',
      event_date: new Date(row.opened_at || now).toISOString(),
      note: 'Opened (member)',
      created_by: auth.user.email || null,
      actor_id: auth.user.id,
    } as any)

    // Return canonical mapped shape via repository adapter
    const repo = new MemberPositionsLedgerRepository()
    const { position } = await repo.getPositionById(data.id)

    // Invalidate cached position lists for this user.
    // (Upstash does not support scan-based pattern deletes; delete the base key only.)
    await CacheService.delete(CacheKeys.positions(auth.user.id))

    return NextResponse.json({ position }, { status: 201 })
  } catch (error) {
    console.error('POST /api/member/positions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
