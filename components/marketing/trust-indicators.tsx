"use client"

import type React from "react"

import { useState, useEffect } from "react"

const TrustBadge = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
    <div className="text-cyan-400">{icon}</div>
    <div>
      <div className="text-white font-semibold text-sm">{title}</div>
      <div className="text-white/60 text-xs">{subtitle}</div>
    </div>
  </div>
)

const SecurityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const MoneyBackIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const SupportIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

export function TrustIndicators() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div
      className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Trusted & Secure Platform</h3>
        <p className="text-white/70">Your success and security are our top priorities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <TrustBadge icon={<SecurityIcon />} title="Bank-Level Security" subtitle="256-bit SSL encryption" />
        <TrustBadge icon={<MoneyBackIcon />} title="No Setup Fees" subtitle="Start learning immediately" />
        <TrustBadge icon={<SupportIcon />} title="24/7 Expert Support" subtitle="Live chat & Discord community" />
      </div>

      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">10,247 Active Traders</span>
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full border-2 border-white"
                ></div>
              ))}
            </div>
            <span className="text-white/80 text-sm">4.9/5 rating</span>
          </div>
        </div>
      </div>
    </div>
  )
}
