"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import TradingSignalsIllustration from "../bento/trading-signals-illustration"
import MarketAnalysisIllustration from "../bento/market-analysis-illustration"
import PortfolioTrackingIllustration from "../bento/portfolio-tracking-illustration"
import RiskManagementIllustration from "../bento/risk-management-illustration"
import EducationalResourcesIllustration from "../bento/educational-resources-illustration"
import CommunityInsightsIllustration from "../bento/community-insights-illustration"

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const BrainIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

const BarChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span className="font-semibold text-primary">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

interface BentoCardProps {
  title: string
  description: string
  Component: React.ComponentType<{ isHovered: boolean }>
  index: number
}

const BentoCard = ({ title, description, Component, index }: BentoCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleClick = () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 200)
  }

  return (
    <div
      className={`
        overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative 
        cursor-pointer group transition-all duration-500 ease-out
        ${isHovered ? "scale-105 -translate-y-2" : "scale-100 translate-y-0"}
        ${isClicked ? "scale-95" : ""}
        hover:shadow-2xl hover:shadow-cyan-500/20
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${(mousePosition.y - 150) * 0.05}deg) rotateY(${(mousePosition.x - 150) * 0.05}deg) translateZ(20px)`
          : "none",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Animated background with blur effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl transition-all duration-500
          ${isHovered ? "opacity-100" : "opacity-80"}
        `}
        style={{
          background: isHovered ? "rgba(231, 236, 235, 0.15)" : "rgba(231, 236, 235, 0.08)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Animated gradient overlay */}
      <div
        className={`
        absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl
        transition-all duration-500
        ${isHovered ? "opacity-100" : "opacity-50"}
      `}
      />

      {/* Glowing border effect on hover */}
      <div
        className={`
        absolute inset-0 rounded-2xl transition-all duration-500
        ${isHovered ? "shadow-[inset_0_0_20px_rgba(6,182,212,0.3)]" : ""}
      `}
      />

      {/* Floating particles effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`
        self-stretch p-4 flex flex-col justify-start items-start gap-1 relative z-10
        transition-all duration-300
        ${isHovered ? "transform translateZ(10px)" : ""}
      `}
      >
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <p
            className={`
            self-stretch text-foreground font-medium leading-6
            transition-all duration-300
            ${isHovered ? "text-cyan-100" : ""}
          `}
          >
            {title} <br />
            <span
              className={`
              text-muted-foreground text-sm transition-all duration-300
              ${isHovered ? "text-cyan-200/80" : ""}
            `}
            >
              {description}
            </span>
          </p>
        </div>
      </div>

      <div
        className={`
        self-stretch h-48 relative -mt-0.5 z-10 overflow-hidden
        transition-all duration-500
        ${isHovered ? "transform translateZ(20px)" : ""}
      `}
      >
        <div
          className={`
          w-full h-full transition-all duration-500
          ${isHovered ? "scale-110" : "scale-100"}
        `}
        >
          <Component isHovered={isHovered} />
        </div>
      </div>

      {/* Interactive tooltip on hover */}
      {isHovered && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg backdrop-blur-sm border border-cyan-500/30 z-20 animate-fadeIn">
          Click to explore
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
        </div>
      )}
    </div>
  )
}

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeCard, setActiveCard] = useState<number | null>(null)
  const [memberCount, setMemberCount] = useState(1000)

  useEffect(() => {
    setIsVisible(true)
    
    // Fetch live Discord member count
    fetch('/api/discord/member-count')
      .then(res => res.json())
      .then(data => {
        if (data.memberCount) {
          setMemberCount(data.memberCount)
        }
      })
      .catch(() => {
        // Fallback to 1000 if API fails
        setMemberCount(1000)
      })
  }, [])

  const tradingCards = [
    {
      title: "80% Strategic Investing",
      description: "Build your wealth foundation with smart long-term investment strategies and portfolio allocation guidance.",
      Component: PortfolioTrackingIllustration,
    },
    {
      title: "20% Day Trading Education",
      description: "Learn active trading techniques with real-time market analysis and strategic entry/exit points.",
      Component: TradingSignalsIllustration,
    },
    {
      title: "Live Discord Community",
      description: "Connect with active learners sharing insights, strategies, and real-time market discussions.",
      Component: CommunityInsightsIllustration,
    },
    {
      title: "Daily Market Education",
      description: "Continuous learning with daily market analysis, educational content, and skill-building resources.",
      Component: EducationalResourcesIllustration,
    },
    {
      title: "Smart Risk Management",
      description: "Master position sizing, risk assessment, and capital protection strategies for both investing and trading.",
      Component: RiskManagementIllustration,
    },
    {
      title: "AI-Powered Market Insights",
      description: "Advanced market analysis tools and intelligent alerts to identify the best investment and trading opportunities.",
      Component: MarketAnalysisIllustration,
    },
  ]

  return (
    <div className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)] animate-pulse" />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-shimmer" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(6,182,212,0.03)_49%,rgba(6,182,212,0.03)_51%,transparent_52%)] bg-[length:20px_20px] animate-float" />

        {/* Floating geometric shapes */}
        <div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-cyan-300/20 rounded-full animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "5s" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-7xl mx-auto">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Nexural Trading Logo */}
          <div className="flex justify-center mb-12">
            <div className="relative group">
              <div className="w-24 h-24 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <radialGradient id="hero-bg-gradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity="0.4"/>
                      <stop offset="50%" stopColor="#00cc66" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.8"/>
                    </radialGradient>
                    <linearGradient id="hero-bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00ff88"/>
                      <stop offset="100%" stopColor="#00cc66"/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Animated background circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="url(#hero-bg-gradient)" 
                    stroke="#00ff88" 
                    strokeWidth="2" 
                    opacity="0.9"
                    className="animate-pulse"
                    filter="url(#glow)"
                  />
                  
                  {/* Trading bars with animation */}
                  <g transform="translate(50, 50)" className="group-hover:scale-110 transition-transform duration-500">
                    <g transform="translate(-15, -10)">
                      <rect x="0" y="6" width="4" height="10" fill="url(#hero-bar-gradient)" rx="1" className="animate-pulse" style={{animationDelay: '0s'}}/>
                      <rect x="5" y="4" width="4" height="12" fill="url(#hero-bar-gradient)" rx="1" className="animate-pulse" style={{animationDelay: '0.2s'}}/>
                      <rect x="10" y="2" width="4" height="14" fill="url(#hero-bar-gradient)" rx="1" className="animate-pulse" style={{animationDelay: '0.4s'}}/>
                      <rect x="15" y="3" width="4" height="13" fill="url(#hero-bar-gradient)" rx="1" className="animate-pulse" style={{animationDelay: '0.6s'}}/>
                      <rect x="20" y="5" width="4" height="11" fill="url(#hero-bar-gradient)" rx="1" className="animate-pulse" style={{animationDelay: '0.8s'}}/>
                      <rect x="25" y="7" width="4" height="9" fill="url(#hero-bar-gradient)" rx="1" className="animate-pulse" style={{animationDelay: '1s'}}/>
                    </g>
                  </g>
                  
                  {/* Floating dots with enhanced animation */}
                  <circle cx="20" cy="15" r="2" fill="#00ff88" opacity="0.8" className="animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}/>
                  <circle cx="80" cy="20" r="1.5" fill="#00ff88" opacity="0.6" className="animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}/>
                  <circle cx="85" cy="35" r="2.5" fill="#00ff88" opacity="0.7" className="animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}/>
                  <circle cx="15" cy="75" r="1.8" fill="#00ff88" opacity="0.5" className="animate-bounce" style={{animationDelay: '1.5s', animationDuration: '2.2s'}}/>
                  <circle cx="90" cy="80" r="2" fill="#00ff88" opacity="0.6" className="animate-bounce" style={{animationDelay: '2s', animationDuration: '2.8s'}}/>
                </svg>
              </div>
              {/* Glowing ring effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
            <div className="flex items-center gap-2 text-cyan-300/90 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <CodeIcon />
              <span className="text-sm font-medium">Proprietary Code</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-300/90 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <BrainIcon />
              <span className="text-sm font-medium">In-House AI</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-300/90 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <BarChartIcon />
              <span className="text-sm font-medium">Developer/Trader Built</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-balance">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
              Master the 80/20
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">Wealth Building System</span>
          </h1>

          {/* Live Member Count Badge */}
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-300 font-semibold text-sm sm:text-base">
              {memberCount.toLocaleString()}+ Active Traders
            </span>
          </div>

          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed text-pretty">
            Build lasting wealth with <span className="text-cyan-300 font-semibold">80% strategic investing</span> for stability,
            <br />
            accelerate growth with <span className="text-blue-300 font-semibold">20% day trading</span> for opportunity,
            <br />
            and learn continuously in our <span className="text-purple-300 font-semibold">expert community</span>.
            <br />
            <span className="text-green-400 font-bold text-xl mt-4 block">
              100% FREE - Complete wealth building education
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            {/* Join FREE Community Button */}
            <a href="https://discord.gg/fTS3Nedk" target="_blank" rel="noopener noreferrer">
              <button className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 ease-out border border-cyan-400/30 hover:border-cyan-300/50">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Join FREE Community
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              </button>
            </a>

            {/* Learn More Button - Links to How It Works */}
            <Link href="/how-it-works">
              <button className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </span>
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto mb-16">
            {tradingCards.map((card, index) => (
              <div
                key={card.title}
                className={`transition-all duration-1000 ease-out`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
                  transitionDelay: `${index * 150}ms`,
                }}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <BentoCard {...card} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Additional content can be added here */}
      </div>
    </div>
  )
}
