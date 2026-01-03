"use client"

import { useState, useEffect } from "react"
import { AnimatedCounter } from "./animated-counter"

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const InvestIcon = () => (
  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TradingIcon = () => (
  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const CommunityIcon = () => (
  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const EducationIcon = () => (
  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

export function ValueStackSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    // Auto-cycle through sections
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 4)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const valueItems = [
    {
      icon: <InvestIcon />,
      title: "80% Strategic Investing",
      subtitle: "Build Your Foundation",
      features: [
        "Long-term portfolio allocation strategies",
        "Blue-chip stock recommendations",
        "ETF and index fund guidance",
        "Dividend growth investing education",
        "Risk-adjusted return optimization"
      ],
      activeBorder: "border-cyan-500/50",
      activeBg: "bg-gradient-to-br from-cyan-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-cyan-500/20",
      hoverBg: "bg-gradient-to-br from-cyan-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10",
      iconBorder: "border-cyan-500/30",
      subtitleColor: "text-cyan-400",
      dotColor: "bg-cyan-400"
    },
    {
      icon: <TradingIcon />,
      title: "20% Day Trading",
      subtitle: "Accelerate Your Growth",
      features: [
        "Real-time market analysis and alerts",
        "Entry and exit strategy education",
        "Technical analysis training",
        "Risk management for active trading",
        "Live trading room access"
      ],
      activeBorder: "border-blue-500/50",
      activeBg: "bg-gradient-to-br from-blue-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-blue-500/20",
      hoverBg: "bg-gradient-to-br from-blue-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
      iconBorder: "border-blue-500/30",
      subtitleColor: "text-blue-400",
      dotColor: "bg-blue-400"
    },
    {
      icon: <CommunityIcon />,
      title: "Discord Community",
      subtitle: "Learn Together",
      features: [
        "Active learning community",
        "Real-time market discussions",
        "Strategy sharing and feedback",
        "Weekly community challenges",
        "Direct access to experienced traders"
      ],
      activeBorder: "border-purple-500/50",
      activeBg: "bg-gradient-to-br from-purple-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-purple-500/20",
      hoverBg: "bg-gradient-to-br from-purple-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
      iconBorder: "border-purple-500/30",
      subtitleColor: "text-purple-400",
      dotColor: "bg-purple-400"
    },
    {
      icon: <EducationIcon />,
      title: "Daily Education",
      subtitle: "Continuous Learning",
      features: [
        "Daily market analysis and insights",
        "Weekly educational webinars",
        "Comprehensive trading courses",
        "Market psychology training",
        "Personal development resources"
      ],
      activeBorder: "border-green-500/50",
      activeBg: "bg-gradient-to-br from-green-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-green-500/20",
      hoverBg: "bg-gradient-to-br from-green-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-green-500/20 to-green-600/10",
      iconBorder: "border-green-500/30",
      subtitleColor: "text-green-400",
      dotColor: "bg-green-400"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-background via-card/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(6,182,212,0.02)_49%,rgba(6,182,212,0.02)_51%,transparent_52%)] bg-[length:30px_30px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Complete Wealth Building System
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Everything you need to master the 80/20 approach to building lasting wealth through strategic investing and active trading.
          </p>
          
          {/* Price Highlight */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-2xl px-8 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-300">$30</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">Complete</div>
              <div className="text-sm text-muted-foreground">wealth system</div>
            </div>
          </div>
        </div>

        {/* Value Stack Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {valueItems.map((item, index) => (
            <div
              key={item.title}
              className={`
                group relative overflow-hidden rounded-2xl border transition-all duration-700 cursor-pointer
                ${activeSection === index 
                  ? `${item.activeBorder} ${item.activeBg} ${item.activeShadow} scale-105` 
                  : 'border-white/10 bg-card/30 hover:border-white/20 hover:bg-card/50'
                }
              `}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${index * 200}ms`
              }}
              onMouseEnter={() => setActiveSection(index)}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 ${item.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Glowing Border Effect */}
              {activeSection === index && (
                <div className={`absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] animate-pulse`} />
              )}

              <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${item.iconBg} border ${item.iconBorder}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                    <p className={`${item.subtitleColor} font-medium`}>{item.subtitle}</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {item.features.map((feature, featureIndex) => (
                    <div 
                      key={feature}
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        activeSection === index ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-70'
                      }`}
                      style={{ transitionDelay: `${featureIndex * 100}ms` }}
                    >
                      <CheckIcon />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress Indicator */}
                {activeSection === index && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${item.dotColor} animate-pulse`} />
                      Currently highlighted
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
          <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Start Your Wealth Building Journey Today
              </span>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start building wealth with our proven 80/20 system. 
              Cancel anytime, no long-term commitments.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckIcon />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckIcon />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckIcon />
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
