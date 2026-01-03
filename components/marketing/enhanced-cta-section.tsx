"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Users, Sparkles } from "lucide-react"

export function EnhancedCTASection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const benefits = [
    { icon: TrendingUp, text: "23% average returns", color: "text-green-500" },
    { icon: Users, text: "2,500+ investors", color: "text-blue-500" },
  ]

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            LIMITED TIME OFFER
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Ready to Beat the Market?</h2>

          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Join thousands of investors who are already using our AI-powered analysis to identify winning stocks.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Icon className={`w-4 h-4 ${benefit.color}`} />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            )
          })}
        </div>

        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 text-base border-2 border-border focus:border-primary transition-all duration-200"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 px-6 bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 group"
              disabled={isSubmitted}
            >
              {isSubmitted ? (
                "Sent!"
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="outline"
            size="lg"
            className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg bg-transparent"
          >
            View Sample Analysis
          </Button>
          <Button variant="ghost" size="lg" className="transform hover:scale-105 transition-all duration-200">
            Join Discord Community
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          No spam, ever. Unsubscribe with one click. 100% free to start.
        </p>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-500/10 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
    </section>
  )
}
