"use client"

import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/animated-counter"
import { HelpCircle, MessageCircle, Users, Sparkles } from "lucide-react"

export function FAQHero() {
  return (
    <section className="w-full pt-32 pb-20 px-5 relative flex flex-col justify-center items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(6,182,212,0.02)_49%,rgba(6,182,212,0.02)_51%,transparent_52%)] bg-[length:30px_30px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-full px-6 py-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-300">
            <AnimatedCounter end={1000} suffix="+ Members Helped" />
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
            Questions?
          </span>
          <br />
          <span className="text-foreground">
            We've Got Answers
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Everything you need to know about our <span className="text-green-300 font-semibold">FREE community</span>, 
          the <span className="text-cyan-300 font-semibold">80/20 wealth building system</span>, 
          and <span className="text-purple-300 font-semibold">OrderFlow Pro</span> platform
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          {/* 100% FREE */}
          <div className="group p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-cyan-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-green-300">100% FREE</h3>
            <p className="text-sm text-muted-foreground">Community access forever, no credit card required</p>
          </div>

          {/* Instant Access */}
          <div className="group p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-cyan-300">Instant Access</h3>
            <p className="text-sm text-muted-foreground">Join Discord & YouTube library immediately</p>
          </div>

          {/* Active Community */}
          <div className="group p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-purple-300">Active Support</h3>
            <p className="text-sm text-muted-foreground">Real-time help from our trading community</p>
          </div>
        </div>

        {/* Quick Navigation Hint */}
        <p className="text-sm text-muted-foreground pt-8">
          Browse by category below or{" "}
          <a href="#contact" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            contact us directly
          </a>
        </p>
      </div>
    </section>
  )
}
