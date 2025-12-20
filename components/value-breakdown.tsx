"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const DollarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const AcademicIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
)

const BrainIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

interface ValueItem {
  id: string
  icon: React.ComponentType
  title: string
  description: string
  value: string
  color: string
}

const valueItems: ValueItem[] = [
  {
    id: "ai-picks",
    icon: BrainIcon,
    title: "AI-Powered Stock Picks",
    description: "Daily analysis from our proprietary ML models",
    value: "$15",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "analysis",
    icon: ChartIcon,
    title: "Real-Time Market Analysis",
    description: "Professional-grade insights and commentary",
    value: "$8",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "community",
    icon: UsersIcon,
    title: "Discord Community Access",
    description: "2,500+ active traders sharing strategies",
    value: "$5",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "education",
    icon: AcademicIcon,
    title: "Educational Resources",
    description: "Courses, guides, and trading education",
    value: "$4",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "support",
    icon: DollarIcon,
    title: "Priority Support",
    description: "Direct access to our team",
    value: "$3",
    color: "from-pink-500 to-rose-600",
  },
]

const comparisons = [
  { item: "Netflix Premium", price: "$23/mo", value: "Entertainment" },
  { item: "Spotify Premium", price: "$11/mo", value: "Music" },
  { item: "Daily Starbucks", price: "$150/mo", value: "Coffee" },
  { item: "Gym Membership", price: "$50/mo", value: "Fitness" },
]

export function ValueBreakdown() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const totalValue = valueItems.reduce((sum, item) => sum + parseInt(item.value.replace("$", "")), 0)

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
            Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            What Does{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              $30/Month
            </span>{" "}
            Get You?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Let's break down the real value. You're not just paying for a service—you're investing in your financial future.
          </p>
        </motion.div>

        {/* Value Breakdown Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {valueItems.map((item, index) => {
            const Icon = item.icon
            const isHovered = hoveredItem === item.id
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Card className={`p-6 h-full bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 transition-all duration-300 ${
                  isHovered ? "border-cyan-500/50 shadow-lg shadow-cyan-500/20 scale-105" : ""
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${item.color} p-3 flex items-center justify-center shadow-lg`}>
                      <Icon />
                    </div>
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-lg font-bold">
                      {item.value}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Total Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-2">Total Value Breakdown</h3>
                <p className="text-muted-foreground">
                  If purchased separately, these services would cost you ${totalValue}/month
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-muted-foreground line-through">${totalValue}</div>
                  <div className="text-sm text-muted-foreground">Separate Value</div>
                </div>
                <div className="text-4xl font-bold text-cyan-400">→</div>
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    $30
                  </div>
                  <div className="text-sm text-cyan-400">Your Price</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              That's Just <span className="text-cyan-400">$1 Per Day</span>
            </h3>
            <p className="text-lg text-muted-foreground">
              Less than your morning coffee, but with the potential to transform your financial future
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cost Comparison */}
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
              <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <DollarIcon />
                Compare to Daily Expenses
              </h4>
              <div className="space-y-3">
                {comparisons.map((comp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-foreground">{comp.item}</div>
                      <div className="text-sm text-muted-foreground">{comp.value}</div>
                    </div>
                    <div className="text-lg font-bold text-cyan-400">{comp.price}</div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* ROI Potential */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-green-500/20">
              <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ChartIcon />
                Your Potential ROI
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Monthly Investment</div>
                  <div className="text-3xl font-bold text-cyan-400">$30</div>
                </div>
                <div className="h-px bg-border/50" />
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    If you make just ONE successful trade per month...
                  </div>
                  <div className="text-2xl font-bold text-green-400">$300 - $3,000+</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    10x - 100x return on your subscription
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our members average 30-60% annual portfolio growth. Even conservative gains far exceed the subscription cost.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* The Real Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                <Lightbulb className="w-16 h-16 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-bold mb-6">
                The <span className="text-cyan-400">Real Value</span> Isn't the Price
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                It's the knowledge you gain, the community you join, and the financial freedom you build. 
                We're not selling you a subscription—we're offering you a systematic path to wealth building.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <div className="text-2xl font-bold text-cyan-400 mb-2">Education</div>
                  <div className="text-sm text-muted-foreground">Learn strategies that last a lifetime</div>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400 mb-2">Community</div>
                  <div className="text-sm text-muted-foreground">Connect with 2,500+ like-minded investors</div>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400 mb-2">Results</div>
                  <div className="text-sm text-muted-foreground">Build real, sustainable wealth</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
