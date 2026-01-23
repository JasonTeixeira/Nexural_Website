"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PricingTiers() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  const tiers = [
    {
      name: "Community & Education",
      description: "Everything you need to start trading - completely free forever",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Full Discord community access",
        "YouTube educational content library",
        "Free trading indicators",
        "Weekly market analysis & stock picks",
        "Live Q&A sessions with analysts",
        "Portfolio reviews & feedback",
        "Risk management training",
        "Trading psychology education",
        "Real-time market discussions",
        "24/7 community support",
        "No credit card required"
      ],
      limitations: [],
      cta: "Join Free Community",
      popular: true,
      href: "/subscribe?plan=free",
      available: true,
      planId: "community-free"
    },
    {
      name: "OrderFlow Pro Platform",
      description: "Professional options orderflow analysis & stock scanning platform",
      monthlyPrice: 100,
      annualPrice: 1200,
      features: [
        "Everything in Community & Education",
        "Real-time options orderflow data",
        "Professional stock scanner with AI",
        "Growth stock detection algorithms",
        "Unusual options activity alerts",
        "Institutional money flow tracking",
        "Custom screening criteria",
        "Advanced technical indicators",
        "Professional-grade analytics dashboard",
        "API access & data exports",
        "Priority support",
        "Advanced backtesting tools"
      ],
      limitations: [],
      cta: "Join Waitlist",
      popular: false,
      href: "/orderflow-platform",
      available: false,
      comingSoon: "Q3 2026",
      badge: "Coming Soon",
      planId: "orderflow-pro"
    }
  ]

  return (
    <section className="px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Choose Your Path
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            Start with our proven 80/20 wealth building system, or join the waitlist for advanced automation coming mid-2026.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <Badge className="ml-2 text-xs bg-green-500 text-white">
                Save 17%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-500 ${
                tier.popular 
                  ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 shadow-2xl shadow-cyan-500/20 scale-105" 
                  : tier.available 
                    ? "border-white/10 bg-card/30 hover:border-white/20 hover:bg-card/50"
                    : "border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:shadow-lg hover:shadow-purple-500/20"
              }`}
            >
              {/* Background Effects */}
              <div className="absolute inset-0">
                {tier.popular && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
                )}
                {!tier.available && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
                )}
              </div>

              {/* Badges */}
              {tier.popular && (
                <Badge className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg z-20">
                  Most Popular
                </Badge>
              )}
              {tier.badge && !tier.available && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg z-20">
                  {tier.badge}
                </Badge>
              )}

              <div className="relative z-10 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-5xl font-bold ${tier.popular ? 'text-cyan-300' : tier.available ? 'text-foreground' : 'text-purple-300'}`}>
                        ${billingCycle === "monthly" ? tier.monthlyPrice : Math.floor(tier.annualPrice / 12)}
                      </span>
                      <span className="text-muted-foreground text-lg">/month</span>
                    </div>
                    {billingCycle === "annual" && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Billed annually (${tier.annualPrice})
                      </div>
                    )}
                    {!tier.available && tier.comingSoon && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 py-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-purple-300">
                          Coming {tier.comingSoon}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground">
                    What's Included
                  </h4>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          tier.popular 
                            ? 'bg-cyan-500/20 border border-cyan-500/30' 
                            : tier.available 
                              ? 'bg-primary/20 border border-primary/30'
                              : 'bg-purple-500/20 border border-purple-500/30'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            tier.popular ? 'text-cyan-400' : tier.available ? 'text-primary' : 'text-purple-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`leading-relaxed ${
                          featureIndex === 0 && !tier.available ? 'font-medium text-purple-300' : 'text-muted-foreground'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                {tier.available ? (
                  <Link href={tier.href}>
                    <Button
                      className={`w-full text-lg py-6 rounded-xl font-semibold transition-all duration-300 ${
                        tier.popular 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {tier.cta}
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full text-lg py-6 rounded-xl font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                    disabled
                  >
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {tier.cta}
                    </span>
                  </Button>
                )}

                {/* Coming Soon Notice */}
                {!tier.available && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-purple-400/80">
                      Be the first to know when automation launches
                    </p>
                  </div>
                )}
              </div>

              {/* Glowing Border Effect */}
              {tier.popular && (
                <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] pointer-events-none" />
              )}
              {!tier.available && (
                <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_20px_rgba(147,51,234,0.2)] pointer-events-none" />
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            All plans can be cancelled anytime with no long-term commitments.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Secure payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
