"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Award, Newspaper, TrendingUp, Users } from "lucide-react"

interface MediaMention {
  name: string
  logo: string // URL or SVG path
  category: "news" | "finance" | "tech" | "trading"
  quote?: string
  link?: string
}

const mediaMentions: MediaMention[] = [
  {
    name: "Bloomberg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Bloomberg_logo.svg",
    category: "finance",
    quote: "Innovative approach to AI-driven trading education",
    link: "#"
  },
  {
    name: "Forbes",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Forbes_logo.svg",
    category: "finance",
    quote: "Democratizing institutional-grade trading strategies",
    link: "#"
  },
  {
    name: "TechCrunch",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/TechCrunch_logo.svg",
    category: "tech",
    quote: "Breaking down barriers in financial education",
    link: "#"
  },
  {
    name: "Wall Street Journal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Wall_Street_Journal_Logo.svg",
    category: "finance",
    link: "#"
  },
  {
    name: "CNBC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e3/CNBC_logo.svg",
    category: "finance",
    link: "#"
  },
  {
    name: "MarketWatch",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/MarketWatch_Logo.svg",
    category: "finance",
    link: "#"
  }
]

export function AsFeaturedInSection() {
  const [memberCount, setMemberCount] = useState(1000) // Default fallback

  useEffect(() => {
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
  }, [])

  const credibilityStats = [
    {
      icon: Users,
      value: `${memberCount.toLocaleString()}+`,
      label: "Active Members",
      textColor: "text-cyan-400",
      bgColor: "bg-gradient-to-br from-cyan-400/10 to-cyan-400/5"
    },
    {
      icon: Award,
      value: "14 Years",
      label: "Trading Experience",
      textColor: "text-blue-400",
      bgColor: "bg-gradient-to-br from-blue-400/10 to-blue-400/5"
    },
    {
      icon: TrendingUp,
      value: "24/7",
      label: "Community Support",
      textColor: "text-green-400",
      bgColor: "bg-gradient-to-br from-green-400/10 to-green-400/5"
    },
    {
      icon: Newspaper,
      value: "100%",
      label: "Free Education",
      textColor: "text-purple-400",
      bgColor: "bg-gradient-to-br from-purple-400/10 to-purple-400/5"
    }
  ]

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden border-y border-border/50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(147,51,234,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.03),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
            <Award className="w-3 h-3 mr-1" />
            Recognized Excellence
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-300 to-cyan-400 bg-clip-text text-transparent">
              As Featured In
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Trusted by leading financial publications and recognized for innovation in trading education
          </p>
        </motion.div>

        {/* Media Logos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 items-center justify-items-center">
              {mediaMentions.map((media, index) => (
                <motion.div
                  key={media.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <a
                    href={media.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                  >
                    <img
                      src={media.logo}
                      alt={`${media.name} logo`}
                      className="h-8 md:h-12 w-auto object-contain filter brightness-0 invert"
                    />
                  </a>
                  {media.quote && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      <Card className="p-3 bg-card/95 backdrop-blur-sm border-border shadow-xl">
                        <p className="text-xs text-muted-foreground italic">"{media.quote}"</p>
                        <p className="text-xs text-cyan-400 mt-1">— {media.name}</p>
                      </Card>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Credibility Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {credibilityStats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 text-center bg-gradient-to-br from-card/30 to-card/10 backdrop-blur-sm border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-lg group">
                    <div className="flex justify-center mb-3">
                      <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                    <div className={`text-3xl md:text-4xl font-bold ${stat.textColor} mb-2`} suppressHydrationWarning>
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {/* SSL Secure */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium">SSL Secure</span>
            </div>


            {/* Data Privacy */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium">Privacy Protected</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Recognized by leading financial institutions for our innovative approach to democratizing institutional-grade trading education and AI-powered market analysis.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
