"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function ExitPopup() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [memberCount, setMemberCount] = useState(0)

  useEffect(() => {
    // Check if user already dismissed today
    const dismissedDate = localStorage.getItem('exitPopupDismissed')
    if (dismissedDate === new Date().toDateString()) {
      return
    }

    // Fetch live Discord member count
    fetch('/api/discord/member-count')
      .then(res => res.json())
      .then(data => {
        if (data.memberCount) {
          setMemberCount(data.memberCount)
        }
      })
      .catch(() => {
        setMemberCount(0)
      })

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [dismissed])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('exitPopupDismissed', new Date().toDateString())
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-md w-full mx-4 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30 rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="text-5xl mb-4">⏸️</div>
          <h2 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Wait! Don't Miss Out
            </span>
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Join {memberCount > 0 && <span className="text-cyan-300 font-bold">{memberCount.toLocaleString()}+ traders</span>} getting FREE daily analysis, live signals, and education in our Discord community.
          </p>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center gap-3 text-white/90">
              <span className="text-green-400 text-xl">✓</span>
              <span>100% FREE - No credit card required</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <span className="text-green-400 text-xl">✓</span>
              <span>Daily market analysis</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <span className="text-green-400 text-xl">✓</span>
              <span>Live trading community</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <span className="text-green-400 text-xl">✓</span>
              <span>Education & mentorship</span>
            </div>
          </div>

          <a
            href="https://discord.gg/fTS3Nedk"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg py-4 rounded-xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 mb-3"
          >
            Join FREE Discord Now
          </a>

          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            No thanks, I'll pass on free trading education
          </button>
        </div>
      </div>
    </div>
  )
}
