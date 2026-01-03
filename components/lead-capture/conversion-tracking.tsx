"use client"

import { useEffect } from "react"

// Conversion tracking utilities
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // In production, this would integrate with analytics services
  console.log(`[v0] Conversion Event: ${eventName}`, properties)

  // Example integrations:
  // gtag('event', eventName, properties)
  // analytics.track(eventName, properties)
  // fbq('track', eventName, properties)
}

export const trackPageView = (page: string) => {
  console.log(`[v0] Page View: ${page}`)
  // gtag('config', 'GA_MEASUREMENT_ID', { page_path: page })
}

export const trackConversion = (value: number, currency = "USD") => {
  console.log(`[v0] Conversion: ${value} ${currency}`)
  // gtag('event', 'purchase', { value, currency })
}

// Hook for tracking user behavior
export function useConversionTracking() {
  useEffect(() => {
    trackPageView(window.location.pathname)

    // Track scroll depth
    let maxScroll = 0
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent
        trackEvent("scroll_depth", { percent: scrollPercent })
      }
    }

    // Track time on page
    const startTime = Date.now()
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      trackEvent("time_on_page", { seconds: timeSpent })
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])
}

export function ConversionTracking() {
  useConversionTracking()
  return null
}
