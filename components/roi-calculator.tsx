"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Calculator, DollarSign, TrendingUp, AlertCircle } from "lucide-react"

export function RoiCalculator() {
  const [investment, setInvestment] = useState([10000])
  const [timeframe, setTimeframe] = useState([12])
  const [results, setResults] = useState({
    conservative: 0,
    historical: 0,
    optimistic: 0,
  })

  useEffect(() => {
    const principal = investment[0]
    const months = timeframe[0]

    // Conservative: 8% annual return
    const conservative = principal * Math.pow(1 + 0.08 / 12, months) - principal

    // Historical average: 23% annual return
    const historical = principal * Math.pow(1 + 0.23 / 12, months) - principal

    // Optimistic: 35% annual return
    const optimistic = principal * Math.pow(1 + 0.35 / 12, months) - principal

    setResults({
      conservative: Math.round(conservative),
      historical: Math.round(historical),
      optimistic: Math.round(optimistic),
    })
  }, [investment, timeframe])

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Calculate Your Potential Returns</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our AI-powered analysis could impact your portfolio growth based on historical performance data.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Investment Calculator
            </CardTitle>
            <CardDescription>
              Adjust the parameters below to see potential returns based on different scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-foreground">Initial Investment</label>
                  <span className="text-lg font-bold text-primary">${investment[0].toLocaleString()}</span>
                </div>
                <Slider
                  value={investment}
                  onValueChange={setInvestment}
                  max={100000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>$1,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-foreground">Time Horizon</label>
                  <span className="text-lg font-bold text-primary">{timeframe[0]} months</span>
                </div>
                <Slider value={timeframe} onValueChange={setTimeframe} max={60} min={3} step={3} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>3 months</span>
                  <span>5 years</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-foreground">Conservative</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">+${results.conservative.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">8% annual return</div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Historical Avg</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">+${results.historical.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">23% annual return</div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Optimistic</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">+${results.optimistic.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">35% annual return</div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> These calculations are for educational
                  purposes only and based on historical data. Past performance does not guarantee future results. All
                  investments carry risk of loss.
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                <DollarSign className="w-4 h-4 mr-2" />
                Start Your Investment Journey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
