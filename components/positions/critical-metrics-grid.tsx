"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, BarChart3, PieChart, Target, Zap, Banknote, Globe, Users, Crown, Check } from "lucide-react"

const criticalMetrics = [
  {
    id: 1,
    title: "Current Quarter EPS Growth",
    icon: TrendingUp,
    target: ">25% (Min), >50% (Excellent)",
    importance: "Most Important",
    description: "This is the #1 predictor of future stock performance",
    details:
      "Current quarterly earnings per share growth compared to the same quarter last year. This metric shows if a company's profitability is accelerating right now, not just historically.",
    formula: "((Current Q EPS - Prior Year Q EPS) / Prior Year Q EPS) × 100",
    nonNegotiable: "If current earnings aren't accelerating, skip it",
    color: "bg-red-500",
  },
  {
    id: 2,
    title: "Revenue Growth Rate",
    icon: DollarSign,
    target: ">20% (Min), >40% (Excellent)",
    importance: "Critical",
    description: "Can't have earnings growth without revenue growth long-term",
    details:
      "Year-over-year revenue growth rate. Revenue is the top line that drives everything else. Without growing revenue, earnings growth is often unsustainable.",
    formula: "((Current Revenue - Prior Year Revenue) / Prior Year Revenue) × 100",
    nonNegotiable: "Revenue growth must exceed industry average significantly",
    color: "bg-blue-500",
  },
  {
    id: 3,
    title: "EPS Acceleration Trend",
    icon: BarChart3,
    target: "Current > Previous Quarter Growth",
    importance: "Critical",
    description: "Shows momentum building, not just one-time spike",
    details:
      "Compare current quarter EPS growth to previous quarter's growth. We want to see acceleration, not deceleration in earnings growth.",
    formula: "Current Q Growth Rate vs Previous Q Growth Rate",
    nonNegotiable: "Deceleration = immediate red flag",
    color: "bg-green-500",
  },
  {
    id: 4,
    title: "Gross Margin Quality",
    icon: PieChart,
    target: ">50% and Expanding (varies by industry)",
    importance: "Critical",
    description: "Shows pricing power and business model quality",
    details:
      "Gross profit margin and its trend over time. High and expanding margins indicate strong competitive positioning and pricing power.",
    formula: "((Revenue - Cost of Goods Sold) / Revenue) × 100",
    nonNegotiable: "Shrinking margins = unsustainable growth",
    color: "bg-purple-500",
  },
  {
    id: 5,
    title: "Return on Invested Capital (ROIC)",
    icon: Target,
    target: ">15% (Min), >25% (Excellent)",
    importance: "Critical",
    description: "Shows management can deploy capital efficiently",
    details:
      "Measures how effectively a company uses its capital to generate profits. High ROIC indicates excellent capital allocation and business quality.",
    formula: "Net Operating Profit After Tax / Invested Capital",
    nonNegotiable: "Low ROIC = value-destroying growth",
    color: "bg-orange-500",
  },
  {
    id: 6,
    title: "PEG Ratio (Growth vs Valuation)",
    icon: Zap,
    target: "<1.5 (Reasonable), <1.0 (Excellent)",
    importance: "Critical",
    description: "Must pay reasonable price for growth",
    details:
      "Price/Earnings to Growth ratio. Compares the P/E ratio to the earnings growth rate to determine if a stock is reasonably valued relative to its growth.",
    formula: "P/E Ratio / Annual EPS Growth Rate",
    nonNegotiable: "PEG >2.0 = too expensive regardless of growth",
    color: "bg-yellow-500",
  },
  {
    id: 7,
    title: "Free Cash Flow Growth",
    icon: Banknote,
    target: "Positive and Growing >20%",
    importance: "Critical",
    description: "Real cash generation, not just accounting earnings",
    details:
      "Free cash flow growth shows the company's ability to generate actual cash after necessary investments. This is real money, not just accounting profits.",
    formula: "Operating Cash Flow - Capital Expenditures",
    nonNegotiable: "Negative FCF = question mark on business quality",
    color: "bg-teal-500",
  },
  {
    id: 8,
    title: "Total Addressable Market (TAM)",
    icon: Globe,
    target: "Large and Growing >10% annually",
    importance: "Critical",
    description: "Company needs room to grow for years",
    details:
      "The total market opportunity available to the company. A large and growing TAM ensures the company has runway for sustained growth.",
    formula: "Market Size × Growth Rate × Company's Potential Share",
    nonNegotiable: "Small/shrinking market = limited upside",
    color: "bg-indigo-500",
  },
  {
    id: 9,
    title: "Institutional Ownership Quality",
    icon: Users,
    target: ">50% ownership by quality growth funds",
    importance: "Critical",
    description: "Smart money validation and support",
    details:
      "Percentage of shares owned by institutional investors, particularly growth-focused funds. Smart money backing provides validation and support.",
    formula: "Institutional Shares / Total Shares Outstanding",
    nonNegotiable: "No institutional interest = red flag",
    color: "bg-pink-500",
  },
  {
    id: 10,
    title: "Management Track Record",
    icon: Crown,
    target: "Proven execution and >5% insider ownership",
    importance: "Critical",
    description: "Great businesses need great execution",
    details:
      "Management's history of execution and their personal investment in the company. Skin in the game aligns interests with shareholders.",
    formula: "Insider Ownership % + Historical Performance Metrics",
    nonNegotiable: "Poor management kills great opportunities",
    color: "bg-rose-500",
  },
]

export function CriticalMetricsGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Story Context - The Problem */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium mb-6">
            The Foundation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            The Problem I Solved
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              For 15 years, I analyzed thousands of stocks. I lost <span className="text-destructive font-semibold">$50,000</span> learning what DOESN'T work.
            </p>
            <p>
              The breakthrough? I discovered that <span className="text-foreground font-semibold">97% of stocks fail for the SAME 10 reasons</span>.
            </p>
            <p>
              These aren't random metrics - they're the lessons from 15 years of wins and losses, 
              distilled into 10 non-negotiable requirements.
            </p>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center space-y-6 mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            What Separates <span className="text-primary">Winners</span> from <span className="text-destructive">Losers</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            These 10 critical metrics eliminate 97% of stocks, leaving only the highest-probability growth
            candidates. Hover over each card to see the complete formula and analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {criticalMetrics.map((metric) => {
            const IconComponent = metric.icon
            const isHovered = hoveredCard === metric.id

            return (
              <Card
                key={metric.id}
                className={`relative overflow-hidden transition-all duration-500 cursor-pointer group ${
                  isHovered
                    ? "scale-105 shadow-2xl z-10 md:col-span-2 lg:col-span-2 xl:col-span-2"
                    : "hover:scale-102 hover:shadow-lg"
                }`}
                onMouseEnter={() => setHoveredCard(metric.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                        <IconComponent
                          className={`w-5 h-5 text-white`}
                          style={{ color: metric.color.replace("bg-", "#").replace("-500", "") }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-muted-foreground">#{metric.id}</span>
                          {metric.importance === "Most Important" && (
                            <Badge variant="destructive" className="text-xs px-2 py-0">
                              {metric.importance}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{metric.title}</h3>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">TARGET</p>
                        <p className="text-sm font-semibold text-primary">{metric.target}</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{metric.description}</p>
                    </div>

                    {/* Expanded Details (shown on hover) */}
                    {isHovered && (
                      <div className="space-y-4 border-t border-border pt-4 animate-in slide-in-from-bottom-2 duration-300">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">DETAILED ANALYSIS</p>
                          <p className="text-sm text-foreground leading-relaxed">{metric.details}</p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">FORMULA</p>
                          <code className="text-sm bg-muted px-3 py-2 rounded-md block text-foreground">
                            {metric.formula}
                          </code>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">NON-NEGOTIABLE</p>
                          <p className="text-sm text-destructive font-medium">{metric.nonNegotiable}</p>
                        </div>
                      </div>
                    )}

                    {/* Hover Indicator */}
                    {!isHovered && (
                      <div className="mt-auto pt-4">
                        <p className="text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                          Hover for formula & details →
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-destructive/10 border border-destructive/20">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-destructive">ALL 10 metrics must pass - No exceptions</span>
          </div>
        </div>

        {/* Story Conclusion - Why This Works */}
        <div className="max-w-4xl mx-auto mt-20">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                Why This Works
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These 10 metrics eliminate the noise. They filter out the hype, the hope, and the guesswork.
                </p>
                <p>
                  What's left? Only companies with:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span><span className="font-semibold text-foreground">Real earnings growth</span> (not accounting tricks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span><span className="font-semibold text-foreground">Sustainable business models</span> (not one-hit wonders)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span><span className="font-semibold text-foreground">Quality management</span> (not promoters)</span>
                  </li>
                </ul>
                <p className="pt-4 text-lg font-semibold text-foreground text-center">
                  This is how you find the next Amazon, not the next Enron.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
