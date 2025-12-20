"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
)

const ZapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
)

interface PricingPlan {
  name: string
  monthlyPrice: string
  annualPrice: string
  description: string
  features: string[]
  buttonText: string
  popular?: boolean
  comingSoon?: boolean
  icon: React.ComponentType
  color: string
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Community & Education",
    monthlyPrice: "Free",
    annualPrice: "Free",
    description: "Everything you need to start trading - completely free",
    features: [
      "Full Discord community access",
      "YouTube educational content library",
      "Free trading indicators",
      "Weekly market analysis & picks",
      "Live Q&A sessions",
      "Portfolio reviews & feedback",
      "24/7 community support",
      "No credit card required",
    ],
    buttonText: "Join Free Community",
    popular: true,
    icon: SparklesIcon,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "OrderFlow Pro Platform",
    monthlyPrice: "$100",
    annualPrice: "$100",
    description: "Professional options flow analysis & stock scanning platform",
    features: [
      "Everything in Free tier",
      "Real-time options orderflow data",
      "Professional stock scanner with AI",
      "Growth stock detection algorithms",
      "Unusual options activity alerts",
      "Institutional money flow tracking",
      "Custom screening criteria",
      "Professional-grade analytics",
      "API access & data exports",
    ],
    buttonText: "Join Waitlist",
    comingSoon: true,
    icon: RocketIcon,
    color: "from-cyan-500 to-blue-600",
  },
]

const comparisonFeatures = [
  { name: "Weekly Stock Picks", newsletter: true, premium: true, auto: true },
  { name: "AI Analysis", newsletter: "Basic", premium: "Advanced", auto: "Advanced" },
  { name: "Discord Community", newsletter: false, premium: true, auto: true },
  { name: "Live Q&A Sessions", newsletter: false, premium: true, auto: true },
  { name: "Portfolio Reviews", newsletter: false, premium: true, auto: true },
  { name: "Priority Support", newsletter: false, premium: true, auto: true },
  { name: "Automated Trading", newsletter: false, premium: false, auto: true },
]

export function PricingSectionEnhanced() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

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
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Investment Edge
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From free weekly picks to premium Discord community access. Start with our newsletter and upgrade when you're ready for more.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/50">
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                isAnnual
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="font-medium">Annually</span>
              {isAnnual && <span className="ml-2 text-xs">(Save $60)</span>}
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                !isAnnual
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="font-medium">Monthly</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon
            const isHovered = hoveredPlan === plan.name
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
                className="relative"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg px-4 py-1 animate-pulse flex items-center gap-1">
                      <Star className="w-4 h-4 fill-white" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`p-8 h-full bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 transition-all duration-300 ${
                    plan.popular
                      ? "border-cyan-500/50 shadow-xl shadow-cyan-500/20 scale-105"
                      : isHovered
                        ? "border-cyan-500/30 shadow-lg shadow-cyan-500/10 scale-105"
                        : ""
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} p-3 flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.comingSoon ? (
                      <div>
                        <div className="text-4xl font-bold text-cyan-400 mb-2">Coming Soon</div>
                        <div className="text-sm text-muted-foreground">Late 2026</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                            {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                          </span>
                          {plan.monthlyPrice !== "$0" && (
                            <span className="text-muted-foreground">/month</span>
                          )}
                        </div>
                        {isAnnual && plan.monthlyPrice !== "$0" && (
                          <div className="text-sm text-green-400 mt-2 flex items-center gap-1 justify-start">
                            <DollarSign className="w-4 h-4" />
                            Save $60/year
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mb-6 ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    } transform hover:scale-105 transition-all duration-300`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-muted-foreground mb-3">
                      {plan.name === "Newsletter" ? "What you get:" : "Everything included:"}
                    </div>
                    {plan.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckIcon />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Feature Comparison Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400"
          >
            {showComparison ? "Hide" : "Show"} Detailed Comparison
          </Button>
        </motion.div>

        {/* Feature Comparison Table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 overflow-x-auto">
              <h3 className="text-2xl font-bold text-center mb-8">Feature Comparison</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Feature</th>
                    <th className="text-center py-4 px-4 text-foreground font-bold">Newsletter</th>
                    <th className="text-center py-4 px-4 text-cyan-400 font-bold">Discord Premium</th>
                    <th className="text-center py-4 px-4 text-purple-400 font-bold">AI Auto-Trading</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-4 text-foreground">{feature.name}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.newsletter === "boolean" ? (
                          feature.newsletter ? (
                            <CheckIcon className="inline text-green-400" />
                          ) : (
                            <XIcon className="inline text-red-400" />
                          )
                        ) : (
                          <span className="text-muted-foreground">{feature.newsletter}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.premium === "boolean" ? (
                          feature.premium ? (
                            <CheckIcon className="inline text-green-400" />
                          ) : (
                            <XIcon className="inline text-red-400" />
                          )
                        ) : (
                          <span className="text-cyan-400 font-medium">{feature.premium}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.auto === "boolean" ? (
                          feature.auto ? (
                            <CheckIcon className="inline text-green-400" />
                          ) : (
                            <XIcon className="inline text-red-400" />
                          )
                        ) : (
                          <span className="text-purple-400 font-medium">{feature.auto}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  )
}
