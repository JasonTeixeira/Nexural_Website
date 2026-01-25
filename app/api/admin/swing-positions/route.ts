import { NextRequest, NextResponse } from 'next/server'
import { emitDeletionGateHit } from '@/lib/deletion-gate'
import { requireAdmin, requireRole } from '@/lib/admin-rbac'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * LEGACY: /api/admin/swing-positions
 *
 * Phase P0 deprecation policy (Option A):
 * - Keep GET temporarily for operational visibility while we migrate UIs.
 * - Block ALL writes (POST/PUT/DELETE) to prevent SSOT drift.
 *
 * Replacement SSOT:
 * - /api/admin/positions (trading_positions + position_events)
 */

function legacyReadOnlyResponse() {
  return NextResponse.json(
    {
      error: 'Legacy endpoint is read-only',
      message: 'Publishing is SSOT via /api/admin/positions. This legacy route is deprecated.',
      deprecated: true,
      replacement: '/api/admin/positions',
    },
    { status: 410 }
  )
}

export async function GET(req: NextRequest) {
  emitDeletionGateHit('legacy.api.admin.swing_positions', { method: 'GET' })

  // Require admin auth for legacy reads (owner/support only)
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireRole(admin, ['owner', 'support'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Intentionally return a structured deprecation message.
  // If you still need legacy data temporarily, we can re-enable a read-only proxy
  // to `swing_positions` behind this auth check.
  return NextResponse.json(
    {
      deprecated: true,
      message: 'This endpoint is deprecated. Use /api/admin/positions for SSOT trading ledger.',
      replacement: '/api/admin/positions',
    },
    { status: 200 }
  )
}

export async function POST(req: NextRequest) {
  emitDeletionGateHit('legacy.api.admin.swing_positions', { method: 'POST' })
  // Block writes immediately.
  await requireAdmin(req) // still forces auth before revealing details
  return legacyReadOnlyResponse()
}

export async function PUT(req: NextRequest) {
  emitDeletionGateHit('legacy.api.admin.swing_positions', { method: 'PUT' })
  await requireAdmin(req)
  return legacyReadOnlyResponse()
}

export async function DELETE(req: NextRequest) {
  emitDeletionGateHit('legacy.api.admin.swing_positions', { method: 'DELETE' })
  await requireAdmin(req)
  return legacyReadOnlyResponse()
}
