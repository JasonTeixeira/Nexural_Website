/**
 * MOBILE HOOKS
 * React hooks for mobile-specific functionality
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// =============================================================================
// DEVICE DETECTION
// =============================================================================

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  isIOS: boolean
  isAndroid: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    orientation: 'landscape',
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()
      
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      const orientation = width > height ? 'landscape' : 'portrait'

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isIOS,
        isAndroid,
        screenWidth: width,
        screenHeight: height,
        orientation,
      })
    }

    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// =============================================================================
// BREAKPOINT DETECTION
// =============================================================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xl')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 640) setBreakpoint('xs')
      else if (width < 768) setBreakpoint('sm')
      else if (width < 1024) setBreakpoint('md')
      else if (width < 1280) setBreakpoint('lg')
      else if (width < 1536) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

// =============================================================================
// TOUCH GESTURES
// =============================================================================

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  duration: number
}

export function useSwipeGesture(
  onSwipe?: (gesture: SwipeGesture) => void,
  threshold: number = 50
) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y
    const duration = Date.now() - touchStart.current.time

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    let direction: SwipeGesture['direction'] = null
    let distance = 0

    if (absX > absY && absX > threshold) {
      direction = deltaX > 0 ? 'right' : 'left'
      distance = absX
    } else if (absY > absX && absY > threshold) {
      direction = deltaY > 0 ? 'down' : 'up'
      distance = absY
    }

    if (direction && onSwipe) {
      onSwipe({ direction, distance, duration })
    }

    touchStart.current = null
  }, [onSwipe, threshold])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }
}

// =============================================================================
// LONG PRESS
// =============================================================================

export function useLongPress(
  callback: () => void,
  duration: number = 500
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      callback()
    }, duration)
  }, [callback, duration])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  }
}

// =============================================================================
// SCROLL LOCK (for modals on mobile)
// =============================================================================

export function useScrollLock() {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [isLocked])

  return {
    isLocked,
    lock: () => setIsLocked(true),
    unlock: () => setIsLocked(false),
    toggle: () => setIsLocked(!isLocked),
  }
}

// =============================================================================
// VIEWPORT HEIGHT (handles mobile browser chrome)
// =============================================================================

export function useViewportHeight() {
  const [vh, setVh] = useState(0)

  useEffect(() => {
    const updateVh = () => {
      const height = window.innerHeight
      setVh(height * 0.01)
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`)
    }

    updateVh()
    window.addEventListener('resize', updateVh)
    window.addEventListener('orientationchange', updateVh)

    return () => {
      window.removeEventListener('resize', updateVh)
      window.removeEventListener('orientationchange', updateVh)
    }
  }, [])

  return vh
}

// =============================================================================
// SAFE AREA INSETS (for notch/home indicator)
// =============================================================================

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement)
      
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
      })
    }

    updateInsets()
  }, [])

  return insets
}

// =============================================================================
// NETWORK STATUS
// =============================================================================

export interface NetworkStatus {
  isOnline: boolean
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
  })

  useEffect(() => {
    const updateStatus = () => {
      const connection = (navigator as any).connection
      
      setStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 50,
        saveData: connection?.saveData || false,
      })
    }

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      if (connection) {
        connection.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return status
}

// =============================================================================
// INSTALL PROMPT (PWA)
// =============================================================================

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setIsInstallable(false)

    return outcome === 'accepted'
  }

  return {
    isInstallable,
    promptInstall,
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  useDeviceDetection,
  useBreakpoint,
  useSwipeGesture,
  useLongPress,
  useScrollLock,
  useViewportHeight,
  useSafeAreaInsets,
  useNetworkStatus,
  useInstallPrompt,
}
