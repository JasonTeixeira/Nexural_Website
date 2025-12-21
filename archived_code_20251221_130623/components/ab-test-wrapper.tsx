"use client"

import { useState, useEffect, type ReactNode } from "react"
import { trackEvent } from "./conversion-tracking"

interface ABTestProps {
  testName: string
  variants: {
    name: string
    component: ReactNode
    weight?: number
  }[]
  children?: ReactNode
}

export function ABTestWrapper({ testName, variants, children }: ABTestProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has already been assigned a variant
    const storageKey = `ab_test_${testName}`
    const existingVariant = localStorage.getItem(storageKey)

    if (existingVariant) {
      setSelectedVariant(existingVariant)
    } else {
      // Assign variant based on weights
      const totalWeight = variants.reduce((sum, variant) => sum + (variant.weight || 1), 0)
      const random = Math.random() * totalWeight

      let currentWeight = 0
      for (const variant of variants) {
        currentWeight += variant.weight || 1
        if (random <= currentWeight) {
          setSelectedVariant(variant.name)
          localStorage.setItem(storageKey, variant.name)
          trackEvent("ab_test_assigned", {
            testName,
            variant: variant.name,
          })
          break
        }
      }
    }
  }, [testName, variants])

  if (!selectedVariant) return <>{children}</>

  const variant = variants.find((v) => v.name === selectedVariant)
  return <>{variant?.component || children}</>
}

// Hook for tracking A/B test conversions
export function useABTestConversion(testName: string, conversionEvent: string) {
  return (additionalData?: Record<string, any>) => {
    const storageKey = `ab_test_${testName}`
    const variant = localStorage.getItem(storageKey)

    if (variant) {
      trackEvent("ab_test_conversion", {
        testName,
        variant,
        conversionEvent,
        ...additionalData,
      })
    }
  }
}
