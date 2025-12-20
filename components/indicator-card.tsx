"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, Sparkles, Star, Download, ExternalLink, CheckCircle2 } from "lucide-react"
import type { Indicator } from "@/lib/indicators-data"

interface IndicatorCardProps {
  indicator: Indicator
  index: number
}

export function IndicatorCard({ indicator, index }: IndicatorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = indicator.icon

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'popular':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300'
      case 'new':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300'
      case 'pro-favorite':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300'
      default:
        return ''
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trend':
        return 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 text-cyan-300'
      case 'momentum':
        return 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-300'
      case 'volume':
        return 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-300'
      case 'volatility':
        return 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-300'
      case 'multi-purpose':
        return 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-300'
      default:
        return 'from-gray-500/10 to-gray-600/5 border-gray-500/20 text-gray-300'
    }
  }

  const getIconColor = (category: string) => {
    switch (category) {
      case 'trend':
        return 'text-cyan-400'
      case 'momentum':
        return 'text-blue-400'
      case 'volume':
        return 'text-purple-400'
      case 'volatility':
        return 'text-orange-400'
      case 'multi-purpose':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const getIconBgColor = (category: string) => {
    switch (category) {
      case 'trend':
        return 'bg-cyan-500/10 border-cyan-500/20'
      case 'momentum':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'volume':
        return 'bg-purple-500/10 border-purple-500/20'
      case 'volatility':
        return 'bg-orange-500/10 border-orange-500/20'
      case 'multi-purpose':
        return 'bg-green-500/10 border-green-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer
        ${isHovered 
          ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-transparent shadow-2xl shadow-cyan-500/20 scale-105 -translate-y-2' 
          : 'border-white/10 bg-card/30 hover:border-white/20'
        }
      `}
      style={{
        opacity: 1,
        transform: 'translateY(0)',
        transitionDelay: `${index * 100}ms`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glowing Border Effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] animate-pulse" />
      )}

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${getIconBgColor(indicator.category)} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <IconComponent className={`w-6 h-6 ${getIconColor(indicator.category)}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-cyan-100 transition-colors">
                {indicator.name}
              </h3>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gradient-to-r mt-1 ${getCategoryColor(indicator.category)}`}>
                {indicator.category.charAt(0).toUpperCase() + indicator.category.slice(1).replace('-', ' ')}
              </div>
            </div>
          </div>
          
          {indicator.badge && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border bg-gradient-to-r flex items-center gap-1 ${getBadgeColor(indicator.badge)}`}>
              {indicator.badge === 'popular' && (
                <>
                  <Flame className="h-3 w-3" />
                  <span>Popular</span>
                </>
              )}
              {indicator.badge === 'new' && (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>New</span>
                </>
              )}
              {indicator.badge === 'pro-favorite' && (
                <>
                  <Star className="h-3 w-3" />
                  <span>Pro</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground group-hover:text-foreground/90 transition-colors mb-4 text-sm leading-relaxed">
          {indicator.description}
        </p>

        {/* Features List */}
        <div className="space-y-2 mb-6">
          {indicator.features.map((feature, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-2 transition-all duration-300 ${
                isHovered ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-80'
              }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href={indicator.tradingViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/btn relative overflow-hidden w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          <span className="relative z-10">View on TradingView</span>
          <ExternalLink className="w-4 h-4 relative z-10" />
        </Link>
      </div>
    </div>
  )
}
