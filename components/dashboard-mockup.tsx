"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Bell,
  MessageSquare,
  BarChart3,
  Target
} from "lucide-react"

export function DashboardMockup() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'performance' | 'positions' | 'community'>('performance')

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const mockPositions = [
    { symbol: "AAPL", entry: 175.50, current: 182.30, change: 3.87, status: "winning" },
    { symbol: "MSFT", entry: 380.20, current: 395.80, change: 4.10, status: "winning" },
    { symbol: "NVDA", entry: 485.00, current: 478.20, change: -1.40, status: "losing" },
  ]

  const mockSignals = [
    { time: "2 min ago", text: "New AI pick: TSLA - Strong buy signal", type: "signal" },
    { time: "15 min ago", text: "Market update: Tech sector showing strength", type: "update" },
    { time: "1 hour ago", text: "Community: 5 members discussing AAPL", type: "community" },
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
          Your Command Center
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Everything You Need{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            In One Place
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A powerful dashboard that puts all your trading tools, insights, and community at your fingertips
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50 shadow-2xl">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
              <div>
                <h3 className="text-2xl font-bold">Member Dashboard</h3>
                <p className="text-sm text-muted-foreground">Welcome back, Trader</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <button className="relative p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Portfolio</span>
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">$52,340</div>
                  <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12.5%
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Win Rate</span>
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">68%</div>
                  <div className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +5% this month
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Active Trades</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-purple-400">8</div>
                  <div className="text-xs text-purple-400 mt-1">
                    3 long-term, 5 active
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Signals</span>
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-orange-400">12</div>
                  <div className="text-xs text-orange-400 mt-1">
                    New this week
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border/50">
              {(['performance', 'positions', 'community'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? 'text-cyan-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'performance' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Performance Chart Mockup */}
                  <Card className="p-6 bg-muted/30 border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Portfolio Growth</h4>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        +12.5% This Month
                      </Badge>
                    </div>
                    <div className="relative h-48">
                      {/* Simplified chart visualization */}
                      <svg className="w-full h-full" viewBox="0 0 400 150">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <motion.path
                          d="M 0 120 L 50 110 L 100 100 L 150 95 L 200 85 L 250 75 L 300 70 L 350 60 L 400 50"
                          fill="none"
                          stroke="rgb(6, 182, 212)"
                          strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: isVisible ? 1 : 0 }}
                          transition={{ duration: 2, delay: 0.8 }}
                        />
                        <motion.path
                          d="M 0 120 L 50 110 L 100 100 L 150 95 L 200 85 L 250 75 L 300 70 L 350 60 L 400 50 L 400 150 L 0 150 Z"
                          fill="url(#chartGradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isVisible ? 1 : 0 }}
                          transition={{ duration: 1, delay: 1.5 }}
                        />
                      </svg>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'positions' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {mockPositions.map((position, index) => (
                    <motion.div
                      key={position.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-muted/30 border-border/50 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
                              {position.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold">{position.symbol}</div>
                              <div className="text-xs text-muted-foreground">
                                Entry: ${position.entry}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${position.current}</div>
                            <div className={`text-xs flex items-center gap-1 justify-end ${
                              position.status === 'winning' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {position.status === 'winning' ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {position.change > 0 ? '+' : ''}{position.change}%
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {mockSignals.map((signal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-muted/30 border-border/50">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            signal.type === 'signal' ? 'bg-green-400 animate-pulse' :
                            signal.type === 'update' ? 'bg-blue-400' :
                            'bg-purple-400'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm">{signal.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{signal.time}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold mb-2">Real-Time Data</h4>
            <p className="text-sm text-muted-foreground">
              Live market data and instant notifications
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold mb-2">AI Insights</h4>
            <p className="text-sm text-muted-foreground">
              Powered by advanced algorithms
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold mb-2">Community</h4>
            <p className="text-sm text-muted-foreground">
              Connect with 2,500+ active traders
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
