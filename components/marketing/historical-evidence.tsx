"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Quote, TrendingUp, Target } from "lucide-react"

const legends = [
  {
    name: "Peter Lynch",
    quote: "Earnings, earnings, earnings",
    focus: "focused on EPS growth above all",
    avatar: "PL",
    color: "bg-blue-500",
  },
  {
    name: "William O'Neil",
    quote: "Current quarterly earnings was his #1 factor in CANSLIM",
    focus: "systematic approach to growth investing",
    avatar: "WO",
    color: "bg-green-500",
  },
  {
    name: "ARK Invest",
    quote: "TAM, innovation, and ROIC are their core filters",
    focus: "disruptive innovation investing",
    avatar: "AI",
    color: "bg-purple-500",
  },
  {
    name: "T. Rowe Price",
    quote: "Revenue growth + margin expansion = their formula",
    focus: "quality growth at reasonable prices",
    avatar: "TP",
    color: "bg-orange-500",
  },
]

const successMetrics = [
  {
    metric: "10 Critical Metrics",
    rate: "80%+",
    description: "success rate when all pass",
    icon: Target,
  },
  {
    metric: "Adding Nice-to-Haves",
    rate: "90%+",
    description: "success rate for top-scoring candidates",
    icon: TrendingUp,
  },
  {
    metric: "Historical Returns",
    rate: "25-40%",
    description: "annual returns for qualifying companies",
    icon: Quote,
  },
]

export function HistoricalEvidence() {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Story Hook */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium mb-6">
            Proven Track Record
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Standing on the Shoulders of Giants
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              I didn't invent growth investing. I studied the <span className="text-foreground font-semibold">legends who mastered it</span>.
            </p>
            <p>
              Then I combined their best insights into one systematic approach that works in today's markets.
            </p>
            <p className="text-foreground font-semibold text-xl pt-4">
              Here's what I learned from each era:
            </p>
          </div>
        </div>

        <div className="text-center space-y-4 mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">The Evolution of Growth Investing</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            60+ years of proven strategies, combined into one system
          </p>
        </div>

        {/* Legendary Investors */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">What the Legends Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legends.map((legend, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${legend.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                    >
                      {legend.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-lg mb-2">{legend.name}</h4>
                      <Quote className="w-4 h-4 text-muted-foreground mb-2" />
                      <p className="text-foreground font-medium mb-2 italic">"{legend.quote}"</p>
                      <p className="text-muted-foreground text-sm">{legend.focus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Probability */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">Success Probability</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successMetrics.map((item, index) => {
              const IconComponent = item.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <IconComponent className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">{item.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary mb-2">{item.rate}</div>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bottom Line */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-foreground flex items-center justify-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Bottom Line
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-lg">The 10 Critical Metrics</h4>
                <p className="text-muted-foreground">
                  Are non-negotiable - they represent the fundamental requirements for a true growth company. These
                  alone will eliminate 97%+ of stocks and leave you with the highest-probability growth candidates.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-lg">The Nice-to-Haves</h4>
                <p className="text-muted-foreground">
                  Are for optimization - they help you rank the remaining candidates, size your positions, and time your
                  entries. But they should never override a failure in the critical metrics.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 text-center">
              <p className="text-lg font-semibold text-foreground mb-2">
                Keep it simple: Quality over quantity always wins in growth investing.
              </p>
              <p className="text-muted-foreground">
                This approach mirrors what the most successful growth investors actually do - they have their
                non-negotiable requirements, then use additional factors to optimize their decisions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Evolution Timeline Summary */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                The Complete Evolution
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 flex-shrink-0">
                    <Badge className="bg-blue-500">1960s-1980s</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Peter Lynch Era</h4>
                    <p className="text-muted-foreground text-sm">
                      <span className="font-semibold text-foreground">Lesson:</span> Focus on earnings growth above all else
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-24 flex-shrink-0">
                    <Badge className="bg-green-500">1980s-2000s</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">William O'Neil Era</h4>
                    <p className="text-muted-foreground text-sm">
                      <span className="font-semibold text-foreground">Lesson:</span> Systematic approach and timing matter
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-24 flex-shrink-0">
                    <Badge className="bg-purple-500">2000s-2020s</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Modern Growth Funds</h4>
                    <p className="text-muted-foreground text-sm">
                      <span className="font-semibold text-foreground">Lesson:</span> Quality metrics (TAM, ROIC, Innovation) separate winners
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-24 flex-shrink-0">
                    <Badge className="bg-cyan-500">2020s-Today</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Our System</h4>
                    <p className="text-muted-foreground text-sm">
                      <span className="font-semibold text-foreground">Result:</span> Combined the best of each era into one systematic approach
                    </p>
                  </div>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 mt-8">
                  <p className="text-lg font-semibold text-foreground text-center mb-2">
                    60+ Years of Proven Strategies
                  </p>
                  <p className="text-muted-foreground text-center">
                    We didn't reinvent the wheel. We perfected it for today's markets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
