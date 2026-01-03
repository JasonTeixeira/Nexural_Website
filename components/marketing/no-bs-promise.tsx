"use client"

import { useState, useEffect } from "react"

export function NoBSPromise() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStat, setCurrentStat] = useState(0)
  const [discordMembers, setDiscordMembers] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)

    // Fetch real Discord member count
    async function fetchDiscordMembers() {
      try {
        const response = await fetch('/api/discord/member-count')
        const data = await response.json()
        setDiscordMembers(data.memberCount || 0)
      } catch (error) {
        console.error('Error fetching Discord members:', error)
      }
    }
    fetchDiscordMembers()

    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 3)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    { value: discordMembers ? discordMembers.toLocaleString() : "...", label: "Discord Members", sublabel: "Active Community" },
    { value: "14 Years", label: "Trading Experience", sublabel: "Shared Knowledge" },
    { value: "24/7", label: "Community Support", sublabel: "Always Available" },
  ]

  return (
    <section className="relative z-10 max-w-[1320px] mx-auto px-6 mt-8 md:mt-12">
      <div
        className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12 max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
              <svg
                className="w-10 h-10 text-primary relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Commitment to Transparency</h2>
              <p className="text-lg text-primary font-medium">Real Results. Real Trades. Real Education.</p>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
              <div className="bg-muted/30 rounded-xl p-6 border border-border/30">
                <p className="text-lg md:text-xl font-medium text-foreground mb-4">
                  No inflated promises. No hidden strategies. No marketing gimmicks.
                </p>
                <p className="text-base md:text-lg">
                  We provide complete transparency in every trade recommendation, including entry points, exit
                  strategies, risk management, and detailed market analysis. Our goal is to build your financial
                  literacy through proven methodologies and real-world application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-card/30 rounded-lg p-6 border border-border/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Complete Trade Documentation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Every trade includes detailed entry/exit rationale, risk assessment, and post-trade analysis for
                    continuous learning.
                  </p>
                </div>

                <div className="bg-card/30 rounded-lg p-6 border border-border/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Performance Metrics
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All results are independently verified and updated in real-time with complete trade history
                    available.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="text-4xl font-bold text-primary mb-2 transition-all duration-300 group-hover:scale-110">
                    100%
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">Transparent Trades</div>
                  <div className="text-xs text-muted-foreground">Every position documented</div>
                </div>

                <div className="text-center group">
                  <div className="text-4xl font-bold text-primary mb-2 transition-all duration-300 group-hover:scale-110">
                    {stats[currentStat].value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">{stats[currentStat].label}</div>
                  <div className="text-xs text-muted-foreground">{stats[currentStat].sublabel}</div>
                </div>

                <div className="text-center group">
                  <div className="text-4xl font-bold text-primary mb-2 transition-all duration-300 group-hover:scale-110">
                    Zero
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">Marketing Fluff</div>
                  <div className="text-xs text-muted-foreground">Pure trading intelligence</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/20">
              
              
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
