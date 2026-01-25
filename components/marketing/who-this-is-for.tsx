"use client"

import { Check, X } from 'lucide-react'

export function WhoThisIsFor() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Is This Community Right for You?
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're not for everyone. Here's who thrives in our FREE community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Perfect For */}
        <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-2xl p-8 border border-green-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-green-400">Perfect For You If:</h3>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You want to learn</strong> — not just copy signals mindlessly
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You're committed to the 80/20 approach</strong> — building wealth through strategic investing (80%) and tactical trading (20%)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You value community</strong> — learning alongside like-minded traders
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You're a complete beginner</strong> — we have educational resources to get you started safely
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You're an experienced trader</strong> — looking for data-driven signals and intelligent discussion
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You appreciate transparency</strong> — real metrics, honest results, no BS
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You understand risk</strong> — trading involves losses, and no system is perfect
              </span>
            </li>
          </ul>
        </div>

        {/* Not For */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-8 border border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-red-400">Not For You If:</h3>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You want "get rich quick"</strong> — We focus on sustainable, long-term wealth building
              </span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You expect 100% win rate</strong> — Our edge is 5-7%, not perfection
              </span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You want financial advice</strong> — We're educational. You make your own trading decisions
              </span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You're looking for "hot tips"</strong> — We focus on systematic, data-driven analysis
              </span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You can't handle losses</strong> — Even the best strategies have losing trades
              </span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You want someone to manage your money</strong> — We teach, we don't trade for you
              </span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">You're not willing to learn</strong> — Success requires effort and education
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-500/20">
          <h3 className="text-2xl font-bold mb-4">Sound Like You?</h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our FREE Discord community of traders who value education, transparency, and sustainable wealth building. 
            No credit card. No commitment. Just instant access to everything.
          </p>
          <a
			href="https://discord.gg/p8Dy4sQHaR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Join FREE Discord Now
          </a>
          <p className="text-sm text-green-400 font-semibold mt-4">
            ✓ Instant Access • ✓ No Payment Required • ✓ Always FREE
          </p>
        </div>
      </div>
    </div>
  )
}
