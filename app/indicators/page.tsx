"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { IndicatorCard } from "@/components/indicator-card"
import { indicators, categories } from "@/lib/indicators-data"
import { 
  Search, 
  Target, 
  Code2, 
  RefreshCw, 
  Clock, 
  Settings, 
  CheckCircle2, 
  Gem,
  BookOpen,
  MessageCircle,
  BarChart3,
  GraduationCap,
  Users,
  Sparkles
} from "lucide-react"

export default function IndicatorsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const filteredIndicators = indicators.filter(indicator => {
    const matchesCategory = selectedCategory === 'all' || indicator.category === selectedCategory
    const matchesSearch = indicator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         indicator.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen hero-gradient">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full pt-32 pb-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(6,182,212,0.03)_49%,rgba(6,182,212,0.03)_51%,transparent_52%)] bg-[length:20px_20px] animate-float" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} suppressHydrationWarning>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-full px-6 py-2 mb-6">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">Professional Trading Tools</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
                Free TradingView Indicators
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Access our proprietary indicators built by professional traders.
              <br />
              <span className="text-cyan-300 font-semibold text-2xl">ALL Indicators. 100% Free. Forever.</span>
              <br />
              <span className="text-green-300 font-medium">No signup. No credit card. No limits.</span>
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-300">{indicators.length}</div>
                <div className="text-sm text-muted-foreground">Free Indicators</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">$0</div>
                <div className="text-sm text-muted-foreground">Always Free</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#indicators-grid" className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Browse Indicators</span>
              </a>
              <a href="https://discord.gg/fTS3Nedk" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <span className="relative z-10">Join FREE Community</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Our Indicators */}
      <section className="py-16 bg-gradient-to-br from-background via-card/30 to-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Why Use Our Indicators?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Code2, 
                title: 'Built by Pro Traders', 
                desc: 'Created by experienced traders with real market knowledge',
                color: 'text-cyan-400',
                bgColor: 'bg-cyan-500/10',
                borderColor: 'border-cyan-500/20'
              },
              { 
                icon: RefreshCw, 
                title: 'Regular Updates', 
                desc: 'Continuously improved based on market conditions and feedback',
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/20'
              },
              { 
                icon: Clock, 
                title: 'All Timeframes', 
                desc: 'Works perfectly on any timeframe from 1-minute to monthly',
                color: 'text-purple-400',
                bgColor: 'bg-purple-500/10',
                borderColor: 'border-purple-500/20'
              },
              { 
                icon: Settings, 
                title: 'Professional Quality', 
                desc: 'Institutional-grade tools built with advanced algorithms',
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/20'
              },
              { 
                icon: CheckCircle2, 
                title: 'Community Tested', 
                desc: 'Used and validated by thousands of active traders',
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/20'
              },
              { 
                icon: Gem, 
                title: 'ALL Indicators Free', 
                desc: 'Every single indicator is 100% free - no paywalls, no limits, forever',
                color: 'text-pink-400',
                bgColor: 'bg-pink-500/10',
                borderColor: 'border-pink-500/20'
              }
            ].map((benefit, idx) => {
              const IconComponent = benefit.icon
              return (
                <div key={idx} className={`group p-6 rounded-xl border ${benefit.borderColor} ${benefit.bgColor} hover:bg-card/50 hover:border-opacity-50 transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl ${benefit.bgColor} border ${benefit.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Indicators Grid */}
      <section id="indicators-grid" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter and Search */}
          <div className="mb-12">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {categories.map((category) => {
                const IconComponent = category.iconComponent
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/10'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </button>
                )
              })}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search indicators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
              />
            </div>

            {/* Results Count */}
            <div className="text-center mt-4 text-muted-foreground">
              Showing {filteredIndicators.length} of {indicators.length} indicators
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredIndicators.map((indicator, index) => (
              <IndicatorCard key={indicator.id} indicator={indicator} index={index} />
            ))}
          </div>

          {/* No Results */}
          {filteredIndicators.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Search className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No indicators found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How to Install */}
      <section className="py-20 bg-gradient-to-br from-card/50 to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              How to Install
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Click Button', desc: 'Click "View on TradingView" on any indicator' },
              { step: '2', title: 'Add to Favorites', desc: 'Save the indicator to your TradingView favorites' },
              { step: '3', title: 'Apply to Chart', desc: 'Open your chart and add the indicator from favorites' },
              { step: '4', title: 'Start Trading', desc: 'Use the indicator to enhance your trading strategy' }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/25">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-full px-6 py-2 mb-6">
              <Gem className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-semibold">All Indicators Free Forever</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Love These Free Tools? Join Our Trading Community
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Keep ALL indicators free. Get live trading education, daily market analysis, and expert community support — 100% FREE forever.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { icon: BookOpen, text: 'Daily market education & analysis' },
                { icon: MessageCircle, text: 'Live Discord trading community' },
                { icon: Target, text: '80/20 wealth building system' },
                { icon: BarChart3, text: 'Real-time trade discussions' },
                { icon: GraduationCap, text: 'Weekly educational webinars' },
                { icon: Users, text: 'Connect with expert traders' }
              ].map((feature, idx) => {
                const IconComponent = feature.icon
                return (
                  <div key={idx} className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-sm text-foreground">{feature.text}</span>
                  </div>
                )
              })}
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-8 flex items-center gap-3 justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <p className="text-cyan-300 font-semibold text-sm">
                Note: All {indicators.length} indicators remain 100% free - membership is for community & education only!
              </p>
            </div>

            <a href="https://discord.gg/fTS3Nedk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
              Join FREE Discord Community
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
