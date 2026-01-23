/**
 * SSOT: Marketplace revenue share is explicit (20%).
 * Source of truth: docs/MARKETPLACE_SPEC.md
 */

export const MARKETPLACE_PLATFORM_FEE_BPS = 2000 // 20%

export function computeMarketplaceFees(amountCents: number, feeBps = MARKETPLACE_PLATFORM_FEE_BPS) {
  if (!Number.isFinite(amountCents) || amountCents < 0) throw new Error('amountCents must be >= 0')
  const platformFeeCents = Math.round((amountCents * feeBps) / 10000)
  const sellerNetCents = Math.max(0, amountCents - platformFeeCents)
  return { platformFeeCents, sellerNetCents, feeBps }
}

