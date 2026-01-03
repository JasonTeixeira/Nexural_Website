"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, TrendingUp, Award } from "lucide-react"

export function ScoringSystem() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Story Context */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium mb-6">
            Practical Implementation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            What This Means for Your Portfolio
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Think of this as <span className="text-foreground font-semibold">airport security for stocks</span>.
            </p>
            <p>
              Every stock must pass through. No exceptions. No VIP treatment. No shortcuts.
            </p>
            <p className="text-foreground font-semibold text-xl pt-4">
              97% get rejected here. That's the point.
            </p>
          </div>
        </div>

        <div className="text-center space-y-4 mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">The Three-Phase Process</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            How we turn analysis into actionable investment decisions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Phase 1 */}
          <Card className="border-2 border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calculator className="w-8 h-8 text-destructive" />
                <div>
                  <CardTitle className="text-xl text-foreground">Phase 1: Critical Screen</CardTitle>
                  <p className="text-muted-foreground text-sm">Binary Pass/Fail</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Pass Rate Required</span>
                    <span className="text-sm font-bold text-destructive">10/10</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">All critical metrics above threshold</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Failure Rate</span>
                    <span className="text-sm font-bold text-destructive">1/10</span>
                  </div>
                  <Progress value={10} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Any single metric failure = disqualify</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Success Rate</span>
                    <span className="text-sm font-bold text-primary">2-3%</span>
                  </div>
                  <Progress value={3} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Of all stocks screened</p>
                </div>
              </div>

              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive text-center">Eliminates 97%+ of stocks</p>
              </div>
            </CardContent>
          </Card>

          {/* Phase 2 */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-xl text-foreground">Phase 2: Enhancement</CardTitle>
                  <p className="text-muted-foreground text-sm">Ranking & Optimization</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Revenue Quality Enhancers</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Revenue acceleration trend</p>
                    <p>• Organic vs acquisition growth</p>
                    <p>• Recurring revenue percentage</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Profitability Refinements</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Operating leverage trends</p>
                    <p>• Asset efficiency ratios</p>
                    <p>• Earnings surprise history</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Market Validation</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Analyst revision momentum</p>
                    <p>• Price momentum vs market</p>
                    <p>• Technical chart patterns</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary text-center">Ranks remaining candidates</p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="border-2 border-green-500/20 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-500" />
                <div>
                  <CardTitle className="text-xl text-foreground">Expected Results</CardTitle>
                  <p className="text-muted-foreground text-sm">Historical Performance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">10 Critical Metrics Only</span>
                    <span className="text-sm font-bold text-green-500">80%+</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Success rate when all pass</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Adding Nice-to-Haves</span>
                    <span className="text-sm font-bold text-green-500">90%+</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Success rate for top-scoring candidates</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Annual Returns</span>
                    <span className="text-sm font-bold text-green-500">25-40%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Historical returns for qualifying companies</p>
                </div>
              </div>

              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <p className="text-sm font-medium text-green-500 text-center">Proven track record</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What This Means Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                What This Means for You
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-destructive">Phase 1:</span> The Filter
                  </h4>
                  <p className="text-muted-foreground">
                    You end up with a portfolio of stocks that have <span className="font-semibold text-foreground">80%+ probability of success</span>, 
                    <span className="font-semibold text-foreground"> 25-40% annual return potential</span>, and 
                    <span className="font-semibold text-foreground"> lower risk than the market average</span>.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-primary">Phase 2:</span> The Ranking
                  </h4>
                  <p className="text-muted-foreground">
                    Now we're choosing between good options. This is where experience and judgment matter. 
                    We're not just finding winners - we're finding the <span className="font-semibold text-foreground">BEST winners</span>.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-green-500">Phase 3:</span> The Result
                  </h4>
                  <p className="text-muted-foreground">
                    That's not luck. That's <span className="font-semibold text-foreground">systematic investing</span>.
                  </p>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 mt-8">
                  <p className="text-lg font-semibold text-foreground text-center">
                    The system does the heavy lifting. You make the final decisions.
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
