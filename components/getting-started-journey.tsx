"use client"

import { motion } from "framer-motion"
import { Rocket, TrendingUp, Zap, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

const RocketIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

interface JourneyStep {
  day: string
  title: string
  description: string
  icon: string
  color: string
  achievements: string[]
  details: string
}

const journeySteps: JourneyStep[] = [
  {
    day: "Day 1",
    title: "Welcome & Onboarding",
    description: "Your journey to financial freedom begins",
    icon: "Rocket",
    color: "from-cyan-500 to-blue-600",
    achievements: [
      "Instant Discord access",
      "Welcome guide & resources",
      "Meet the community",
      "Trading signals access",
    ],
    details:
      "The moment you join, you're part of the family. Get immediate access to our Discord community, receive your personalized welcome guide, and see current trading signals. No waiting, no delays—start learning immediately.",
  },
  {
    day: "Day 7",
    title: "First Week Wins",
    description: "Understanding the 80/20 system",
    icon: "TrendingUp",
    color: "from-green-500 to-emerald-600",
    achievements: [
      "Complete beginner course",
      "Make first strategic investment",
      "Join live Q&A session",
      "Connect with mentors",
    ],
    details:
      "By week one, you've completed the fundamentals course and understand our 80/20 approach. You've made your first strategic investment with confidence, attended a live Q&A, and connected with experienced traders who were once in your shoes.",
  },
  {
    day: "Day 30",
    title: "Building Momentum",
    description: "Your portfolio takes shape",
    icon: "Zap",
    color: "from-purple-500 to-indigo-600",
    achievements: [
      "Diversified portfolio established",
      "First profitable trades",
      "Risk management mastered",
      "Active community contributor",
    ],
    details:
      "One month in, you've built a diversified portfolio following our 80/20 strategy. You've seen your first profitable trades, mastered basic risk management, and you're actively sharing insights in the community. The transformation is real.",
  },
  {
    day: "Day 90",
    title: "Confident Investor",
    description: "Financial freedom in sight",
    icon: "Target",
    color: "from-orange-500 to-red-600",
    achievements: [
      "Consistent portfolio growth",
      "Advanced strategies implemented",
      "Helping other members",
      "Financial goals on track",
    ],
    details:
      "Three months later, you're a confident investor. Your portfolio shows consistent growth, you're implementing advanced strategies, and you're helping newer members. Most importantly, your financial goals are no longer dreams—they're plans in motion.",
  },
]

export function GettingStartedJourney() {
  const [discordMembers, setDiscordMembers] = useState(0)
  
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
  
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            Your Journey
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            From <span className="text-cyan-400">Beginner</span> to{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Confident Investor
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Here's exactly what happens when you join Nexural Trading. No fluff, no hype—just your real path to financial growth.
          </p>
        </motion.div>

        {/* Desktop Timeline (Horizontal) */}
        <div className="hidden lg:block mb-20">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transform -translate-y-1/2" />

            {/* Timeline Steps */}
            <div className="grid grid-cols-4 gap-8 relative">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Icon Circle */}
                  <div className="flex justify-center mb-8">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-2xl relative z-10 border-4 border-background`}>
                      {step.icon === "Rocket" && <Rocket className="w-12 h-12 text-white" />}
                      {step.icon === "TrendingUp" && <TrendingUp className="w-12 h-12 text-white" />}
                      {step.icon === "Zap" && <Zap className="w-12 h-12 text-white" />}
                      {step.icon === "Target" && <Target className="w-12 h-12 text-white" />}
                    </div>
                  </div>

                  {/* Content Card */}
                  <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
                    <Badge className={`mb-3 bg-gradient-to-r ${step.color} text-white border-0`}>
                      {step.day}
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                    <div className="space-y-2">
                      {step.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircleIcon />
                          <span className="text-xs text-muted-foreground">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="lg:hidden space-y-8 mb-16">
          {journeySteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative pl-20"
            >
              {/* Timeline Line */}
              {index < journeySteps.length - 1 && (
                <div className="absolute left-12 top-20 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-500" />
              )}

              {/* Icon Circle */}
              <div className="absolute left-0 top-0">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-2xl border-4 border-background`}>
                  {step.icon === "Rocket" && <Rocket className="w-12 h-12 text-white" />}
                  {step.icon === "TrendingUp" && <TrendingUp className="w-12 h-12 text-white" />}
                  {step.icon === "Zap" && <Zap className="w-12 h-12 text-white" />}
                  {step.icon === "Target" && <Target className="w-12 h-12 text-white" />}
                </div>
              </div>

              {/* Content Card */}
              <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
                <Badge className={`mb-3 bg-gradient-to-r ${step.color} text-white border-0`}>
                  {step.day}
                </Badge>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                <div className="space-y-2">
                  {step.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircleIcon />
                      <span className="text-xs text-muted-foreground">{achievement}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Journey Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            The <span className="text-cyan-400">Complete Story</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 hover:border-cyan-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                      {step.icon === "Rocket" && <Rocket className="w-8 h-8 text-white" />}
                      {step.icon === "TrendingUp" && <TrendingUp className="w-8 h-8 text-white" />}
                      {step.icon === "Zap" && <Zap className="w-8 h-8 text-white" />}
                      {step.icon === "Target" && <Target className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <Badge className={`mb-1 bg-gradient-to-r ${step.color} text-white border-0`}>
                        {step.day}
                      </Badge>
                      <h4 className="text-xl font-bold text-foreground">{step.title}</h4>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.details}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Success Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <RocketIcon />
                <h3 className="text-3xl font-bold">
                  Your <span className="text-cyan-400">Success Story</span> Starts Today
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Every successful investor in our community started exactly where you are now. The difference? 
                They took action. They joined, they learned, they grew. In 90 days, you could be the success 
                story inspiring the next member. Or you could still be wondering "what if?"
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-background/50 rounded-xl border border-cyan-500/20">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    {discordMembers > 0 ? discordMembers.toLocaleString() : '...'} 
                  </div>
                  <div className="text-sm text-muted-foreground">Discord Members</div>
                </div>
                <div className="p-6 bg-background/50 rounded-xl border border-blue-500/20">
                  <div className="text-4xl font-bold text-blue-400 mb-2">FREE</div>
                  <div className="text-sm text-muted-foreground">Always free to join</div>
                </div>
                <div className="p-6 bg-background/50 rounded-xl border border-purple-500/20">
                  <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Community support</div>
                </div>
              </div>
              <Link href="/subscribe">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  Start Your Journey Today
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
