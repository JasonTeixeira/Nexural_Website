"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  TrendingUp, 
  Code, 
  Lightbulb, 
  Rocket,
  Award,
  Users
} from "lucide-react"

interface Milestone {
  year: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  achievement: string
}

const milestones: Milestone[] = [
  {
    year: "2010",
    title: "Started Trading",
    description: "Began journey in financial markets, learning the fundamentals of trading and investing",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-600",
    achievement: "First steps into trading"
  },
  {
    year: "2013",
    title: "Built First Systems",
    description: "Developed initial algorithmic trading systems, combining technical analysis with automation",
    icon: Code,
    color: "from-blue-500 to-cyan-600",
    achievement: "Automated trading begins"
  },
  {
    year: "2017",
    title: "Discovered 80/20",
    description: "Realized the power of combining long-term investing (80%) with active trading (20%)",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-600",
    achievement: "Strategy breakthrough"
  },
  {
    year: "2020",
    title: "Refined Strategy",
    description: "Perfected the system through market cycles, achieving consistent results across conditions",
    icon: Award,
    color: "from-purple-500 to-indigo-600",
    achievement: "Proven track record"
  },
  {
    year: "2023",
    title: "Built Community",
    description: "Started sharing insights with select group, helping others achieve similar results",
    icon: Users,
    color: "from-pink-500 to-rose-600",
    achievement: "Community impact"
  },
  {
    year: "2025",
    title: "Nexural Launch",
    description: "Launched Nexural Trading to bring AI-powered insights and proven strategies to everyone",
    icon: Rocket,
    color: "from-cyan-500 to-blue-600",
    achievement: "Full-scale platform"
  },
]

export function FounderJourneyTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Auto-cycle through milestones
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % milestones.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto text-center mb-16"
      >
        <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
          15 Years of Excellence
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          The Journey to{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Nexural Trading
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          From individual trader to system developer to community builder - 
          15 years of experience distilled into one powerful platform
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto">
        {/* Progress Line */}
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-muted via-cyan-500/20 to-muted transform -translate-y-1/2" />
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 transform -translate-y-1/2"
            initial={{ width: "0%" }}
            animate={{ width: isVisible ? `${((activeIndex + 1) / milestones.length) * 100}%` : "0%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon
            const isActive = index === activeIndex
            const isPast = index < activeIndex

            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isVisible ? 1 : 0, 
                  y: isVisible ? 0 : 20,
                  scale: isActive ? 1.05 : 1
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  scale: { duration: 0.3 }
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className="cursor-pointer"
              >
                <Card
                  className={`p-6 h-full bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 transition-all duration-300 ${
                    isActive
                      ? "border-cyan-500/50 shadow-xl shadow-cyan-500/20"
                      : isPast
                        ? "border-green-500/30"
                        : "hover:border-cyan-500/30"
                  }`}
                >
                  {/* Year Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge 
                      className={`text-lg font-bold ${
                        isActive 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                          : isPast
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {milestone.year}
                    </Badge>
                    {isPast && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${milestone.color} p-3 flex items-center justify-center mb-4 shadow-lg ${
                    isActive ? "animate-pulse" : ""
                  }`}>
                    <Icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {milestone.description}
                  </p>

                  {/* Achievement Badge */}
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? "bg-cyan-400 animate-pulse" : isPast ? "bg-green-400" : "bg-muted-foreground"
                      }`} />
                      <span className="text-xs text-muted-foreground">
                        {milestone.achievement}
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 pt-4 border-t border-cyan-500/20"
                    >
                      <div className="flex items-center justify-center gap-2 text-xs text-cyan-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Current Focus
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Timeline Navigation Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-3 mt-12"
        >
          {milestones.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 h-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                  : index < activeIndex
                    ? "w-3 h-3 bg-green-400 rounded-full"
                    : "w-3 h-3 bg-muted rounded-full hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to ${milestones[index].year}`}
            />
          ))}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2">
              15+
            </div>
            <div className="text-sm text-muted-foreground">Years of Experience</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent mb-2">
              100+
            </div>
            <div className="text-sm text-muted-foreground">Systems Developed</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent mb-2">
              2,500+
            </div>
            <div className="text-sm text-muted-foreground">Members Helped</div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
