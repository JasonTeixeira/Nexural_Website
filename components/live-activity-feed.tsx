"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign } from "lucide-react"

const activities = [
  { name: "Sarah M.", action: "joined premium", location: "New York", time: "2 min ago", icon: Users },
  { name: "Michael R.", action: "made 34% profit", location: "California", time: "5 min ago", icon: TrendingUp },
  { name: "Jennifer L.", action: "upgraded to Pro", location: "Texas", time: "8 min ago", icon: DollarSign },
  { name: "David K.", action: "joined premium", location: "Florida", time: "12 min ago", icon: Users },
  { name: "Lisa W.", action: "made 28% profit", location: "Illinois", time: "15 min ago", icon: TrendingUp },
  { name: "Robert T.", action: "joined premium", location: "Ohio", time: "18 min ago", icon: Users },
]

export function LiveActivityFeed() {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 3000)

    const activityTimer = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length)
    }, 4000)

    return () => {
      clearTimeout(showTimer)
      clearInterval(activityTimer)
    }
  }, [])

  const activity = activities[currentActivity]
  const Icon = activity.icon

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm">
      
    </div>
  )
}
