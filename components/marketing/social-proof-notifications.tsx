"use client"

import { useState, useEffect } from "react"
import { trackEvent } from "./conversion-tracking"

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const getNotifications = (discordMembers: number | null) => [
  {
    message: "New members joining daily",
    subtext: "Join the FREE community",
    icon: UsersIcon,
    type: "users",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    message: "New educational content available",
    subtext: "Learn the 80/20 strategy",
    icon: TrendingUpIcon,
    type: "education",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    message: discordMembers ? `${discordMembers.toLocaleString()} Discord members` : "Active Discord community",
    subtext: "Growing community",
    icon: StarIcon,
    type: "community",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  {
    message: "Daily market insights posted",
    subtext: "FREE analysis & education",
    icon: TrendingUpIcon,
    type: "content",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
  },
]

export function SocialProofNotifications() {
  const [currentNotification, setCurrentNotification] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [discordMembers, setDiscordMembers] = useState<number | null>(null)

  useEffect(() => {
    // Fetch Discord member count
    async function fetchDiscordMembers() {
      try {
        const response = await fetch('/api/discord/member-count')
        const data = await response.json()
        setDiscordMembers(data.memberCount || 0)
      } catch (error) {
        console.error('Error fetching Discord members:', error)
      }
    }
    fetchDiscordMembers()

    const showTimer = setTimeout(() => {
      setIsVisible(true)
      const notifs = getNotifications(discordMembers)
      trackEvent("social_proof_shown", { notification: notifs[0].message })
    }, 3000)

    const rotateTimer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentNotification((prev) => {
          const notifs = getNotifications(discordMembers)
          const next = (prev + 1) % notifs.length
          trackEvent("social_proof_rotated", { notification: notifs[next].message })
          return next
        })
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => {
      clearTimeout(showTimer)
      clearInterval(rotateTimer)
    }
  }, [discordMembers])

  const notifications = getNotifications(discordMembers)
  const notification = notifications[currentNotification]
  const Icon = notification.icon

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-xs">
      
    </div>
  )
}
