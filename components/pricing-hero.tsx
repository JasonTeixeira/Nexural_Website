"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/animated-counter"
import { CheckCircle2, Users, TrendingUp, Award, Zap } from "lucide-react"

export function PricingHero() {
  return (
    <div className="text-center space-y-12 py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(6,182,212,0.02)_49%,rgba(6,182,212,0.02)_51%,transparent_52%)] bg-[length:30px_30px]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 backdrop-blur-sm border border-green-500/20 rounded-full px-6 py-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">
            <AnimatedCounter end={1000} suffix="+ Active Members Learning FREE" />
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-green-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Start FREE Forever
          </span>
          <br />
          <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
            Master The 80/20 System
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Learn strategic investing with <span className="text-cyan-300 font-semibold">80% long-term wealth building</span>, 
          accelerate growth with <span className="text-blue-300 font-semibold">20% active trading education</span>, 
          and join our <span className="text-purple-300 font-semibold">expert community</span> — completely free.
        </p>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-12">
          {/* FREE Tier Highlight */}
          <Card className="relative overflow-hidden p-8 border-green-500/50 bg-gradient-to-br from-green-500/10 to-cyan-500/5 shadow-2xl shadow-green-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]" />
            
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-cyan-600 text-white shadow-lg">
              Most Popular
            </Badge>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-foreground">Community & Education</h3>
                  <p className="text-sm text-green-300 font-semibold">100% FREE Forever</p>
                </div>
              </div>

              <div className="text-left space-y-2 pt-4 border-t border-green-500/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Full Discord community access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>YouTube educational content library</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Free trading indicators & analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Weekly market picks & portfolio reviews</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>No credit card required</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="text-5xl font-bold text-green-300 mb-2">$0</div>
                <div className="text-muted-foreground text-sm mb-4">Forever. No hidden fees.</div>
                <Link href="/subscribe?plan=free">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-400 hover:to-cyan-500 text-white font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Join FREE Now
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Pro Platform Preview */}
          <Card className="relative overflow-hidden p-8 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
            
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
              Coming Q3 2026
            </Badge>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-foreground">OrderFlow Pro</h3>
                  <p className="text-sm text-purple-300 font-semibold">Advanced Automation</p>
                </div>
              </div>

              <div className="text-left space-y-2 pt-4 border-t border-purple-500/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Everything in FREE, plus:</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Real-time options orderflow data</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Professional AI-powered scanner</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Institutional money flow tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Advanced analytics & API access</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-purple-300">$100</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <div className="text-muted-foreground text-sm mb-4">Professional-grade platform</div>
                <Button className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50 font-semibold text-lg py-6 rounded-xl transition-all duration-300">
                  <Award className="w-5 h-5 mr-2" />
                  Join Waitlist
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center relative z-10 pt-8">
        <Link href="/subscribe">
          <Button className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-400 hover:to-cyan-500 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 ease-out border border-green-400/30 hover:border-green-300/50">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              Start Learning FREE Today
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
          </Button>
        </Link>
        
        <Link href="/how-it-works">
          <Button className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              See How It Works
            </span>
          </Button>
        </Link>
      </div>
      
      {/* Trust Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto relative z-10 pt-8">
        <div className="flex flex-col items-center gap-2 p-4 bg-card/20 backdrop-blur-sm rounded-xl border border-white/10 hover:border-green-500/30 transition-colors duration-300">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-green-400 font-semibold">No Setup Fees</span>
          <span className="text-muted-foreground text-center text-sm">Start immediately, no barriers</span>
        </div>
        
        <div className="flex flex-col items-center gap-2 p-4 bg-card/20 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors duration-300">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-cyan-400 font-semibold">No Credit Card</span>
          <span className="text-muted-foreground text-center text-sm">Join FREE, no payment info</span>
        </div>
        
        <div className="flex flex-col items-center gap-2 p-4 bg-card/20 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors duration-300">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-purple-400 font-semibold">Instant Access</span>
          <span className="text-muted-foreground text-center text-sm">Start learning immediately</span>
        </div>
      </div>
    </div>
  )
}
