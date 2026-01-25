import { NextResponse } from 'next/server'
import { emitDeletionGateHit } from '@/lib/deletion-gate'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/ops/deletion-gate-test
 *
 * SSOT: Diagnostic endpoint to confirm deletion-gate telemetry is recorded.
 * This emits a hit and returns ok.
 */
export async function GET() {
  emitDeletionGateHit('ops.deletion_gate_test', { method: 'GET' })
  return NextResponse.json({ ok: true, emitted: 'ops.deletion_gate_test' })
}
