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

  // Best-effort DB sink (service-role only) so deletion gates are measurable
  // even when platform log views are request-only.
  // Never block the caller.
  void persistDeletionGateHit(tag, meta)
}

async function persistDeletionGateHit(tag: string, meta?: Record<string, any>) {
  try {
    // Only attempt in server runtime when credentials exist.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from('deletion_gate_hits').insert({
      tag,
      meta: meta ?? null,
    })
  } catch {
    // swallow
  }
}

