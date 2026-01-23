export type DeletionGateHit = {
  type: 'DELETION_GATE_HIT'
  tag: string
  meta?: Record<string, any>
  ts: string
}

/**
 * SSOT deletion-gate telemetry.
 * Source: docs/OPS_RUNBOOK.md
 *
 * This should be called in legacy routes that are candidates for deletion.
 * It's intentionally a stable structured log line.
 */
export function emitDeletionGateHit(tag: string, meta?: Record<string, any>) {
  const payload: DeletionGateHit = {
    type: 'DELETION_GATE_HIT',
    tag,
    meta,
    ts: new Date().toISOString(),
  }

  // Single-line JSON for log searchability.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload))
}

