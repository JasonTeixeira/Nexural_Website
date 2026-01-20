// Placeholder shim for optional IB Gateway PRO integration.
// TODO: replace with real implementation or remove if deprecated by SSOT.

export const ibGatewayManager = {
  initialize: async () => {
    // best-effort stub
    return
  },
  start: async () => {
    throw new Error('IB Gateway manager is not configured')
  },
  stop: async () => {
    throw new Error('IB Gateway manager is not configured')
  },
}
