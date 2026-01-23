"use client"

import { useState, useEffect } from "react"
import { Users, Clock, TrendingUp } from "lucide-react"

export function ScarcityIndicators() {
  const [spotsLeft, setSpotsLeft] = useState(47)
  const [recentJoins, setRecentJoins] = useState(23)

  useEffect(() => {
    // Simulate decreasing spots
    const spotsTimer = setInterval(() => {
      setSpotsLeft((prev) => Math.max(prev - Math.floor(Math.random() * 2), 15))
    }, 30000) // Every 30 seconds

    // Simulate increasing recent joins
    const joinsTimer = setInterval(() => {
      setRecentJoins((prev) => prev + Math.floor(Math.random() * 3))
    }, 45000) // Every 45 seconds

    return () => {
      clearInterval(spotsTimer)
      clearInterval(joinsTimer)
    }
  }, [])

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
        <Users className="w-4 h-4 text-red-600" />
        <span className="text-sm font-medium text-red-800">Only {spotsLeft} spots left this month</span>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      </div>

      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-800">{recentJoins} joined in the last 24h</span>
      </div>

      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Next picks in 2 days</span>
      </div>
    </div>
  )
}
