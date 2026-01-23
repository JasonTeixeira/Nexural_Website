"use client"

import { useState, useEffect } from "react"
import { trackEvent } from "./conversion-tracking"

export function UrgencyTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  })

  useEffect(() => {
    trackEvent("urgency_timer_viewed")

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          // Reset timer when it reaches 0
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-4 text-center">
      <div className="text-red-400 text-sm font-medium mb-2">LIMITED TIME OFFER EXPIRES IN:</div>
      <div className="flex justify-center gap-4">
        <div className="bg-red-500/20 rounded-lg px-3 py-2 min-w-[60px]">
          <div className="text-white text-xl font-bold">{timeLeft.hours.toString().padStart(2, "0")}</div>
          <div className="text-red-300 text-xs">HOURS</div>
        </div>
        <div className="bg-red-500/20 rounded-lg px-3 py-2 min-w-[60px]">
          <div className="text-white text-xl font-bold">{timeLeft.minutes.toString().padStart(2, "0")}</div>
          <div className="text-red-300 text-xs">MINS</div>
        </div>
        <div className="bg-red-500/20 rounded-lg px-3 py-2 min-w-[60px]">
          <div className="text-white text-xl font-bold">{timeLeft.seconds.toString().padStart(2, "0")}</div>
          <div className="text-red-300 text-xs">SECS</div>
        </div>
      </div>
      <div className="text-orange-300 text-sm mt-2">Get 50% off your first month - Don't miss out!</div>
    </div>
  )
}
