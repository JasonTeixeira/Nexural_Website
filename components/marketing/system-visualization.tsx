"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  TrendingUp, 
  Zap, 
  Target,
  Brain,
  Users,
  BarChart3,
  ArrowRight
} from "lucide-react"

export function SystemVisualization() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState<'strategic' | 'active' | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const strategicFeatures = [
    { icon: Target, text: "Long-term positions", color: "text-green-400" },
    { icon: Brain, text: "AI-powered selection", color: "text-blue-400" },
    { icon: BarChart3, text: "Systematic approach", color: "text-purple-400" },
    { icon: TrendingUp, text: "Wealth building focus", color: "text-cyan-400" },
  ]

  const activeFeatures = [
    { icon: Zap, text: "Day trading education", color: "text-yellow-400" },
    { icon: Target, text: "Real-time signals", color: "text-orange-400" },
    { icon: Users, text: "Community learning", color: "text-pink-400" },
    { icon: TrendingUp, text: "Accelerated returns", color: "text-red-400" },
  ]

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
          The 80/20 System
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          How the{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            System Works
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A proven allocation strategy combining long-term wealth building with active growth opportunities
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Main Visualization */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* 80% Strategic Foundation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onMouseEnter={() => setActiveSection('strategic')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <Card className={`p-8 h-full bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-sm border-border/50 transition-all duration-500 ${
              activeSection === 'strategic' 
                ? 'border-green-500/50 shadow-2xl shadow-green-500/20 scale-105' 
                : 'hover:border-green-500/30'
            }`}>
              {/* Percentage Circle */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#greenGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 552" }}
                    animate={{ 
                      strokeDasharray: isVisible ? "442 552" : "0 552" 
                    }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                      80%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Strategic</div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center mb-2">
                Strategic Foundation
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                Build lasting wealth through systematic investing
              </p>

              {/* Features */}
              <div className="space-y-4">
                {strategicFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* 20% Active Growth */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onMouseEnter={() => setActiveSection('active')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <Card className={`p-8 h-full bg-gradient-to-br from-orange-500/10 to-red-500/5 backdrop-blur-sm border-border/50 transition-all duration-500 ${
              activeSection === 'active' 
                ? 'border-orange-500/50 shadow-2xl shadow-orange-500/20 scale-105' 
                : 'hover:border-orange-500/30'
            }`}>
              {/* Percentage Circle */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#orangeGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 552" }}
                    animate={{ 
                      strokeDasharray: isVisible ? "110 552" : "0 552" 
                    }}
                    transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-orange-300 to-red-400 bg-clip-text text-transparent">
                      20%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Active</div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center mb-2">
                Active Growth
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                Accelerate returns with educated trading
              </p>

              {/* Features */}
              <div className="space-y-4">
                {activeFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* How They Work Together */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Card className="p-8 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">
                How They Work{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Together
                </span>
              </h3>
              <p className="text-muted-foreground">
                The perfect balance of stability and growth
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-3 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp className="w-full h-full text-white" />
                </div>
                <h4 className="font-bold mb-2">Build Foundation</h4>
                <p className="text-sm text-muted-foreground">
                  80% in strategic long-term positions for stable growth
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-cyan-400" />
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 p-3 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-full h-full text-white" />
                </div>
                <h4 className="font-bold mb-2">Accelerate Growth</h4>
                <p className="text-sm text-muted-foreground">
                  20% in active trading for enhanced returns
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center md:col-span-3">
                <ArrowRight className="w-8 h-8 text-cyan-400 transform rotate-90 md:rotate-0" />
              </div>

              {/* Step 3 */}
              <div className="text-center md:col-span-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-3 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="w-full h-full text-white" />
                </div>
                <h4 className="font-bold mb-2">Achieve Balance</h4>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Consistent wealth building with opportunities for accelerated growth - 
                  the best of both worlds
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">Lower Risk</div>
            <div className="text-sm text-muted-foreground">
              80% in stable long-term positions
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">Higher Potential</div>
            <div className="text-sm text-muted-foreground">
              20% for accelerated growth
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">Best Balance</div>
            <div className="text-sm text-muted-foreground">
              Proven allocation strategy
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
