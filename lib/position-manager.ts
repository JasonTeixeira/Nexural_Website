/**
 * POSITION MANAGER STUB
 * Future feature - archived in _ARCHIVE/future-features/
 * This stub prevents build errors for unused imports
 */

export function startPriceMonitoring() {
  console.warn('Price monitoring not implemented - future feature')
  return {
    status: 'not_implemented',
    message: 'Real-time price monitoring is a future feature'
  }
}

export function stopPriceMonitoring() {
  console.warn('Price monitoring not implemented - future feature')
}

export function getMonitoringStatus() {
  return {
    active: false,
    message: 'Price monitoring is a future feature'
  }
}
