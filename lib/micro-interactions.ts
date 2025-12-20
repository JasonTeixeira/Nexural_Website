/**
 * Micro-Interactions Utility
 * Delightful animations and interactions for enhanced UX
 */

// Confetti celebration (will work after installing canvas-confetti)
export const triggerConfetti = () => {
  if (typeof window === "undefined") return

  try {
    // Dynamic import to avoid SSR issues
    import("canvas-confetti").then((confetti) => {
      const count = 200
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      }

      function fire(particleRatio: number, opts: any) {
        confetti.default({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        })
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      })

      fire(0.2, {
        spread: 60,
      })

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      })

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      })

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      })
    })
  } catch (error) {
    console.log("Confetti not available:", error)
  }
}

// Success checkmark animation
export const showSuccessCheckmark = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (!element) return

  element.classList.add("animate-success-checkmark")
  setTimeout(() => {
    element.classList.remove("animate-success-checkmark")
  }, 1000)
}

// Button ripple effect
export const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
  const button = event.currentTarget
  const ripple = document.createElement("span")
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.classList.add("ripple")

  button.appendChild(ripple)

  setTimeout(() => {
    ripple.remove()
  }, 600)
}

// Smooth scroll to element
export const smoothScrollTo = (elementId: string, offset: number = 0) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
  const offsetPosition = elementPosition - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  })
}

// Copy to clipboard with feedback
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy:", error)
    return false
  }
}

// Shake animation for errors
export const shakeElement = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (!element) return

  element.classList.add("animate-shake")
  setTimeout(() => {
    element.classList.remove("animate-shake")
  }, 500)
}

// Pulse animation for attention
export const pulseElement = (elementId: string, duration: number = 2000) => {
  const element = document.getElementById(elementId)
  if (!element) return

  element.classList.add("animate-pulse")
  setTimeout(() => {
    element.classList.remove("animate-pulse")
  }, duration)
}

// Loading spinner state
export const showLoadingSpinner = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const spinner = document.createElement("div")
  spinner.className = "loading-spinner"
  spinner.id = `${elementId}-spinner`
  element.appendChild(spinner)
}

export const hideLoadingSpinner = (elementId: string) => {
  const spinner = document.getElementById(`${elementId}-spinner`)
  if (spinner) {
    spinner.remove()
  }
}

// Toast notification
export const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info",
  duration: number = 3000
) => {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }

  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `

  toast.classList.add(colors[type])
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease-in"
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, duration)
}

// Progress bar animation
export const animateProgressBar = (elementId: string, targetPercentage: number, duration: number = 1000) => {
  const element = document.getElementById(elementId) as HTMLElement
  if (!element) return

  let currentPercentage = 0
  const increment = targetPercentage / (duration / 16) // 60fps

  const interval = setInterval(() => {
    currentPercentage += increment
    if (currentPercentage >= targetPercentage) {
      currentPercentage = targetPercentage
      clearInterval(interval)
    }
    element.style.width = `${currentPercentage}%`
  }, 16)
}

// Number counter animation
export const animateCounter = (
  elementId: string,
  targetNumber: number,
  duration: number = 2000,
  prefix: string = "",
  suffix: string = ""
) => {
  const element = document.getElementById(elementId)
  if (!element) return

  let currentNumber = 0
  const increment = targetNumber / (duration / 16) // 60fps

  const interval = setInterval(() => {
    currentNumber += increment
    if (currentNumber >= targetNumber) {
      currentNumber = targetNumber
      clearInterval(interval)
    }
    element.textContent = `${prefix}${Math.floor(currentNumber)}${suffix}`
  }, 16)
}

// Parallax scroll effect
export const initParallax = (elementId: string, speed: number = 0.5) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const handleScroll = () => {
    const scrolled = window.pageYOffset
    const rate = scrolled * speed
    element.style.transform = `translate3d(0, ${rate}px, 0)`
  }

  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}

// Intersection Observer for scroll animations
export const observeElement = (
  elementId: string,
  callback: (isVisible: boolean) => void,
  threshold: number = 0.1
) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting)
      })
    },
    { threshold }
  )

  observer.observe(element)
  return () => observer.disconnect()
}
