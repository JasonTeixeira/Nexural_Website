"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Users, Sparkles } from "lucide-react"

export function FinalPricingCTA() {
  return (
    <section className="px-6 py-20 relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <Card className="overflow-hidden border-green-500/50 bg-gradient-to-br from-green-500/10 via-cyan-500/5 to-blue-500/5 shadow-2xl shadow-green-500/20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(6,182,212,0.03)_49%,rgba(6,182,212,0.03)_51%,transparent_52%)] bg-[length:20px_20px]" />
          </div>

          <div className="relative z-10 p-12 md:p-16 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text text-transparent">
                Ready to Start Your
              </span>
              <br />
              <span className="text-foreground">
                Wealth Building Journey?
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Join our growing community learning the proven 80/20 wealth building system. 
              Get instant access to our Discord community, YouTube content, and free trading tools.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-green-300">FREE</span> forever
                </span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-cyan-300">No credit card</span> required
                </span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-blue-300">Instant</span> access
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/subscribe?plan=free">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-400 hover:to-cyan-500 text-white font-bold text-lg px-12 py-6 rounded-xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 ease-out border border-green-400/30 hover:border-green-300/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    Join FREE Community
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                </Button>
              </Link>

              <Link href="/how-it-works">
                <Button className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-10 py-6 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out">
                  <span className="relative z-10 flex items-center gap-3">
                    Learn More
                  </span>
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["MC", "SJ", "DR", "KL"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white border-2 border-background"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <span>
                <span className="font-semibold text-green-300">Active members</span> learning and growing together
              </span>
            </div>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>100% FREE Forever</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            <span>No Hidden Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </section>
  )
}
