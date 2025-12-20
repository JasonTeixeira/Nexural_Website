"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function UrgencyBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            LIMITED TIME
          </Badge>
          <div className="flex items-center gap-2 text-sm">
            <span>Next stock picks release in:</span>
            <div className="flex items-center gap-1">
              <span className="bg-white/20 px-2 py-1 rounded text-xs">{timeLeft.days}d</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs">{timeLeft.hours}h</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs">{timeLeft.minutes}m</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs">{timeLeft.seconds}s</span>
            </div>
          </div>
          <span className="text-sm">Join now to get immediate access!</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/20 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
