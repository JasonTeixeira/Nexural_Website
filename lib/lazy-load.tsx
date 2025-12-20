/**
 * LAZY LOADING UTILITY
 * Optimizes component loading with code splitting
 * Reduces initial bundle size and improves performance
 */

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

// =============================================================================
// LOADING FALLBACKS
// =============================================================================

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

export const LoadingCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-32 rounded-lg"></div>
  </div>
)

export const LoadingTable = () => (
  <div className="animate-pulse space-y-4">
    <div className="bg-gray-200 h-10 rounded"></div>
    <div className="bg-gray-200 h-10 rounded"></div>
    <div className="bg-gray-200 h-10 rounded"></div>
  </div>
)

// =============================================================================
// LAZY LOADING HELPERS
// =============================================================================

/**
 * Lazy load a component with custom loading fallback
 */
export function lazyLoad<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = <LoadingSpinner />
) {
  return dynamic(importFn, {
    loading: () => <>{fallback}</>,
    ssr: true, // Enable SSR by default for better SEO
  })
}

/**
 * Lazy load without SSR (client-side only)
 */
export function lazyLoadClientOnly<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = <LoadingSpinner />
) {
  return dynamic(importFn, {
    loading: () => <>{fallback}</>,
    ssr: false, // Disable SSR for client-only components
  })
}

/**
 * Lazy load with no fallback (instant)
 */
export function lazyLoadNoFallback<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    ssr: true,
  })
}

// =============================================================================
// PRE-CONFIGURED LAZY LOADERS
// =============================================================================

/**
 * Lazy load chart components (typically large)
 */
export function lazyLoadChart<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    loading: () => (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-lg">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-sm text-gray-600">Loading chart...</p>
        </div>
      </div>
    ),
    ssr: false, // Charts are usually client-side only
  })
}

/**
 * Lazy load modal/dialog components
 */
export function lazyLoadModal<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    loading: () => <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><LoadingSpinner /></div>,
    ssr: false, // Modals are client-side only
  })
}

/**
 * Lazy load heavy components (editor, etc.)
 */
export function lazyLoadHeavy<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  componentName: string = 'Component'
) {
  return dynamic(importFn, {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-sm text-gray-600">Loading {componentName}...</p>
        </div>
      </div>
    ),
    ssr: false,
  })
}

// =============================================================================
// EXPORTS
// =============================================================================

export default lazyLoad
