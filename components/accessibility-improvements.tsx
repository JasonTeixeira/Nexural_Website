"use client"

import { useEffect } from "react"

// Skip to main content link for keyboard navigation
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
    >
      Skip to main content
    </a>
  )
}

// Keyboard navigation improvements
export function KeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modals
      if (e.key === "Escape") {
        const modals = document.querySelectorAll('[role="dialog"]')
        modals.forEach((modal) => {
          const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]')
          if (closeButton instanceof HTMLElement) {
            closeButton.click()
          }
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}

// Focus management for better accessibility
export function FocusManager() {
  useEffect(() => {
    // Ensure focus is visible for keyboard users
    const handleMouseDown = () => {
      document.body.classList.add("using-mouse")
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        document.body.classList.remove("using-mouse")
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return null
}

// Reduced motion support
export function ReducedMotionSupport() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const handleChange = () => {
      if (mediaQuery.matches) {
        document.body.classList.add("reduce-motion")
      } else {
        document.body.classList.remove("reduce-motion")
      }
    }

    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return null
}
