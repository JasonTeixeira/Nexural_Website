"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, FileText, CheckCircle2, TrendingUp, BookOpen, Target, ArrowRight, Gift, Mail, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LeadMagnet {
  id: string
  title: string
  description: string
  icon: typeof FileText
  fileType: string
  pages?: string
  downloads: string
  benefits: string[]
  iconBgColor: string
  iconTextColor: string
  checkColor: string
  buttonGradient: string
  borderHoverColor: string
  shadowHoverColor: string
}

const leadMagnets: LeadMagnet[] = [
  {
    id: "trading-guide",
    title: "The 80/20 Trading System Guide",
    description: "Complete blueprint for our systematic wealth-building approach. Learn how to allocate 80% to strategic investing and 20% to active trading.",
    icon: BookOpen,
    fileType: "PDF",
    pages: "42 pages",
    downloads: "12,000+",
    benefits: [
      "Step-by-step implementation guide",
      "Risk management frameworks",
      "Portfolio allocation strategies",
      "Real trade examples"
    ],
    iconBgColor: "bg-gradient-to-br from-cyan-500/20 to-cyan-500/10",
    iconTextColor: "text-cyan-400",
    checkColor: "text-cyan-400",
    buttonGradient: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500",
    borderHoverColor: "hover:border-cyan-500/30",
    shadowHoverColor: "hover:shadow-cyan-500/10"
  },
  {
    id: "indicators-cheatsheet",
    title: "Top 10 Indicators Cheat Sheet",
    description: "Quick reference guide for the most powerful trading indicators. Includes setup parameters, interpretation, and when to use each one.",
    icon: Target,
    fileType: "PDF",
    pages: "12 pages",
    downloads: "15,000+",
    benefits: [
      "Visual indicator examples",
      "Optimal settings for each timeframe",
      "Combination strategies",
      "Common mistakes to avoid"
    ],
    iconBgColor: "bg-gradient-to-br from-blue-500/20 to-blue-500/10",
    iconTextColor: "text-blue-400",
    checkColor: "text-blue-400",
    buttonGradient: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500",
    borderHoverColor: "hover:border-blue-500/30",
    shadowHoverColor: "hover:shadow-blue-500/10"
  },
  {
    id: "ai-analysis",
    title: "AI-Powered Market Analysis Framework",
    description: "Understanding how our AI analyzes 200+ variables to identify high-probability setups. Includes the exact methodology.",
    icon: TrendingUp,
    fileType: "PDF",
    pages: "28 pages",
    downloads: "8,500+",
    benefits: [
      "AI decision-making process explained",
      "Key variables and their weights",
      "Pattern recognition techniques",
      "Backtesting results"
    ],
    iconBgColor: "bg-gradient-to-br from-green-500/20 to-green-500/10",
    iconTextColor: "text-green-400",
    checkColor: "text-green-400",
    buttonGradient: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500",
    borderHoverColor: "hover:border-green-500/30",
    shadowHoverColor: "hover:shadow-green-500/10"
  }
]

export function FreeLeadMagnetSection() {
  const [email, setEmail] = useState("")
  const [selectedMagnet, setSelectedMagnet] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleDownload = async (magnetId: string) => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setSelectedMagnet(magnetId)

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true)
      setIsSubmitting(false)
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setSelectedMagnet(null)
        setEmail("")
      }, 5000)
    }, 1500)
  }

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-card/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
            <Gift className="w-3 h-3 mr-1" />
            Free Resources
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-300 to-cyan-400 bg-clip-text text-transparent">
              Start Learning Today
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Download our professional trading guides and resources completely free. No credit card required.
          </p>
        </motion.div>

        {/* Lead Magnets Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {leadMagnets.map((magnet, index) => {
            const IconComponent = magnet.icon
            const isSelected = selectedMagnet === magnet.id

            return (
              <motion.div
                key={magnet.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 ${magnet.borderHoverColor} transition-all duration-300 hover:shadow-lg ${magnet.shadowHoverColor} group ${
                  isSuccess && isSelected ? "border-green-500/50 shadow-lg shadow-green-500/20" : ""
                }`}>
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-lg ${magnet.iconBgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-6 h-6 ${magnet.iconTextColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1 text-lg group-hover:text-cyan-400 transition-colors">
                        {magnet.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{magnet.fileType}</Badge>
                        {magnet.pages && <span>• {magnet.pages}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {magnet.description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6">
                    {magnet.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 ${magnet.checkColor} flex-shrink-0 mt-0.5`} />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50 mb-6">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Download className="w-3 h-3" />
                      <span>{magnet.downloads} downloads</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button
                    onClick={() => handleDownload(magnet.id)}
                    disabled={isSubmitting && isSelected}
                    className={`w-full ${
                      isSuccess && isSelected
                        ? "bg-green-500 hover:bg-green-600"
                        : magnet.buttonGradient
                    } text-white font-medium transform hover:scale-105 transition-all duration-300`}
                  >
                    {isSubmitting && isSelected ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Preparing...
                      </span>
                    ) : isSuccess && isSelected ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Check Your Email!
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Email Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Enter Your Email to Download
              </h3>
              <p className="text-muted-foreground mb-8">
                We'll send the download links directly to your inbox. Plus, get exclusive trading tips and market insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background/50 border-border/50 focus:border-cyan-500/50"
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  onClick={() => handleDownload(leadMagnets[0].id)}
                  disabled={!email || isSubmitting}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : isSuccess ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Sent!
                    </span>
                  ) : (
                    "Get All 3 Free"
                  )}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>No Spam Ever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span>Instant Access</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="flex -space-x-2">
              {["MC", "SJ", "DR", "EW"].map((initial, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white border-2 border-background"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm">
              <span className="font-semibold text-cyan-400">35,000+</span> traders have downloaded these resources
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
