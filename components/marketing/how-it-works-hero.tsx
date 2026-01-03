"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AnimatedCounter } from "@/components/animated-counter"
import Link from "next/link"

export function HowItWorksHero() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [memberCount, setMemberCount] = useState(1000) // Default fallback

  useEffect(() => {
    setIsVisible(true)
    
    // Fetch real Discord member count
    fetch('/api/discord/stats')
      .then(res => res.json())
      .then(data => {
        if (data.memberCount > 0) {
          setMemberCount(data.memberCount)
        }
      })
      .catch(error => {
        console.error('Failed to fetch Discord stats:', error)
        // Keep default fallback value
      })
    
    // Auto-cycle through steps
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const steps = [
    { 
      number: "80%", 
      title: "Strategic Foundation", 
      description: "Build wealth through long-term investing",
      textColor: "text-cyan-400",
      activeBorder: "border-cyan-500/50",
      activeBg: "bg-gradient-to-br from-cyan-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-cyan-500/20",
      dotColor: "bg-cyan-400"
    },
    { 
      number: "20%", 
      title: "Active Growth", 
      description: "Accelerate returns with day trading",
      textColor: "text-blue-400",
      activeBorder: "border-blue-500/50",
      activeBg: "bg-gradient-to-br from-blue-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-blue-500/20",
      dotColor: "bg-blue-400"
    },
    { 
      number: "24/7", 
      title: "Community Learning", 
      description: "Continuous education and support",
      textColor: "text-purple-400",
      activeBorder: "border-purple-500/50",
      activeBg: "bg-gradient-to-br from-purple-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-purple-500/20",
      dotColor: "bg-purple-400"
    },
    { 
      number: "FREE", 
      title: "Complete Access", 
      description: "Everything included at no cost",
      textColor: "text-green-400",
      activeBorder: "border-green-500/50",
      activeBg: "bg-gradient-to-br from-green-500/10 to-transparent",
      activeShadow: "shadow-2xl shadow-green-500/20",
      dotColor: "bg-green-400"
    }
  ]

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(6,182,212,0.02)_49%,rgba(6,182,212,0.02)_51%,transparent_52%)] bg-[length:30px_30px]" />
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-cyan-300">The 80/20 System</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                How Wealth
              </span>
              <br />
              <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Building Works
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Master the proven 80/20 approach to building lasting wealth through strategic investing, 
              active trading education, and continuous learning in our expert community.
            </p>
          </div>

          {/* Interactive Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`
                  group relative overflow-hidden rounded-2xl border transition-all duration-700 cursor-pointer
                  ${activeStep === index 
                    ? `${step.activeBorder} ${step.activeBg} ${step.activeShadow} scale-105` 
                    : 'border-white/10 bg-card/30 hover:border-white/20 hover:bg-card/50'
                  }
                `}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 200}ms`
                }}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Glowing Border Effect */}
                {activeStep === index && (
                  <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] animate-pulse" />
                )}

                <div className="relative z-10 p-6 text-center">
                  <div className={`text-4xl font-bold mb-2 ${step.textColor}`}>
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {/* Progress Indicator */}
                  {activeStep === index && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <div className={`w-1.5 h-1.5 rounded-full ${step.dotColor} animate-pulse`} />
                        Step {index + 1} of 4
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Key Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
            <div className="space-y-2 p-6 bg-card/20 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-4xl font-bold text-cyan-400" suppressHydrationWarning>
                <AnimatedCounter end={memberCount} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">Active Learning Members</div>
            </div>
            <div className="space-y-2 p-6 bg-card/20 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-4xl font-bold text-blue-400">80/20</div>
              <div className="text-sm text-muted-foreground">Proven Allocation Strategy</div>
            </div>
            <div className="space-y-2 p-6 bg-card/20 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-4xl font-bold text-green-400">24/7</div>
              <div className="text-sm text-muted-foreground">Community & Education</div>
            </div>
          </div>

          {/* CTA */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
            <a href="https://discord.gg/fTS3Nedk" target="_blank" rel="noopener noreferrer">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 ease-out border border-cyan-400/30 hover:border-cyan-300/50">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Join FREE Community
                </span>
              </Button>
            </a>
            
            <Link href="/indicators">
              <Button className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out">
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Indicators
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
