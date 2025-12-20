"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Shield, Award, Users, TrendingUp, Star, CheckCircle, Lock, Zap } from "lucide-react"

const securityFeatures = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "256-bit SSL encryption protects your data",
  },
  {
    icon: Lock,
    title: "Privacy Protected",
    description: "We never share your personal information",
  },
  {
    icon: CheckCircle,
    title: "Verified Results",
    description: "All performance data is independently audited",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "Instant notifications for time-sensitive picks",
  },
]

const mediaLogos = [
  { name: "TechCrunch", width: "120px" },
  { name: "Forbes", width: "100px" },
  { name: "Bloomberg", width: "140px" },
  { name: "CNBC", width: "80px" },
  { name: "Reuters", width: "110px" },
]

export function TrustSignalsSection() {
  const [discordMembers, setDiscordMembers] = useState<number | null>(null)

  useEffect(() => {
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
  }, [])

  const trustMetrics = [
    {
      icon: Users,
      value: discordMembers ? discordMembers.toLocaleString() : "...",
      label: "Discord Members",
      description: "Growing FREE learning community",
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      value: "24/7",
      label: "Community Support",
      description: "Always available education & insights",
      color: "text-green-600",
    },
    {
      icon: Star,
      value: "100%",
      label: "Free Access",
      description: "All educational content included",
      color: "text-yellow-600",
    },
    {
      icon: Award,
      value: "14 Years",
      label: "Experience",
      description: "Proven trading expertise shared",
      color: "text-purple-600",
    },
  ]

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Trust Metrics */}
        <div className="text-center mb-16">
          <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">TRUSTED BY THOUSANDS</Badge>
          <h2 className="text-3xl font-bold mb-4">Proven Track Record</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Our AI-powered analysis has helped thousands of investors achieve consistent returns in the stock market.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustMetrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300`}
                  >
                    <Icon className={`w-8 h-8 ${metric.color}`} />
                  </div>
                  <div className="text-3xl font-bold mb-2">{metric.value}</div>
                  <div className="font-semibold mb-1">{metric.label}</div>
                  <div className="text-sm text-muted-foreground">{metric.description}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Media Mentions */}
        <div className="text-center mb-16">
          <h3 className="text-xl font-semibold mb-8 text-muted-foreground">As Featured In</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {mediaLogos.map((logo, index) => (
              <div
                key={index}
                className="h-12 flex items-center justify-center hover:opacity-100 transition-opacity duration-300"
                style={{ width: logo.width }}
              >
                <div className="text-lg font-bold text-muted-foreground">{logo.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Your Security is Our Priority</h3>
            <p className="text-muted-foreground">
              We use industry-leading security measures to protect your data and privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="text-center p-4 rounded-lg hover:bg-accent/50 transition-colors duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
