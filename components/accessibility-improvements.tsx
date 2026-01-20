// Backwards-compatible re-export.
export * from './accessibility-improvements'

// Minimal fallbacks used by the landing page.
// TODO: replace with real implementations.
export function SkipToContent() {
  return null
}

export function KeyboardNavigation() {
  return null
}

export function FocusManager() {
  return null
}

export function ReducedMotionSupport() {
  return null
}
