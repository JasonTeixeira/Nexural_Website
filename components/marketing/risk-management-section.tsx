"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function RiskManagementSection() {
  const riskMetrics = [
    {
      title: "Position Sizing",
      description: "Kelly Criterion-based position sizing to optimize risk-adjusted returns",
      formula: "f* = (bp - q) / b",
      explanation:
        "Where f* is the fraction of capital to wager, b is the odds, p is probability of winning, q is probability of losing",
      currentValue: 85,
      benchmark: 60,
      status: "Optimal",
    },
    {
      title: "Portfolio Correlation",
      description: "Diversification analysis to minimize systematic risk exposure",
      formula: "ρ = Cov(X,Y) / (σx × σy)",
      explanation: "Correlation coefficient measuring linear relationship between assets",
      currentValue: 0.23,
      benchmark: 0.4,
      status: "Well Diversified",
    },
    {
      title: "Value at Risk (VaR)",
      description: "Maximum expected loss over a specific time period at given confidence level",
      formula: "VaR = μ - (σ × Z)",
      explanation: "95% confidence level: maximum 1-day loss should not exceed calculated VaR",
      currentValue: 2.8,
      benchmark: 5.0,
      status: "Conservative",
    },
    {
      title: "Sharpe Ratio",
      description: "Risk-adjusted return measurement comparing excess return to volatility",
      formula: "SR = (Rp - Rf) / σp",
      explanation: "Higher ratios indicate better risk-adjusted performance",
      currentValue: 1.84,
      benchmark: 1.2,
      status: "Excellent",
    },
  ]

  const riskControls = [
    {
      control: "Stop Loss Orders",
      description: "Automated exit points to limit downside risk",
      implementation: "Dynamic stops based on volatility (2x ATR)",
      effectiveness: 92,
    },
    {
      control: "Position Limits",
      description: "Maximum allocation per single position",
      implementation: "5% max per stock, 20% max per sector",
      effectiveness: 88,
    },
    {
      control: "Correlation Monitoring",
      description: "Real-time portfolio correlation tracking",
      implementation: "Alert when correlation exceeds 0.7",
      effectiveness: 95,
    },
    {
      control: "Drawdown Protection",
      description: "Portfolio-level risk management",
      implementation: "Reduce exposure at 10% drawdown",
      effectiveness: 89,
    },
  ]

  return (
    <section className="px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Systematic Risk Management</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our quantitative approach to risk management uses proven mathematical models to protect capital while
            maximizing risk-adjusted returns.
          </p>
        </div>

        {/* Risk Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {riskMetrics.map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{metric.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{metric.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {typeof metric.currentValue === "number" && metric.currentValue < 1
                      ? metric.currentValue.toFixed(2)
                      : metric.currentValue}
                    {metric.title === "Value at Risk (VaR)" && "%"}
                  </div>
                  <div className="text-xs text-muted-foreground">{metric.status}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-xs mb-1">Formula:</div>
                  <div className="text-sm">{metric.formula}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">{metric.explanation}</div>

              {/* Progress indicator for comparison */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>vs. Industry Benchmark</span>
                  <span>
                    {typeof metric.benchmark === "number" && metric.benchmark < 1
                      ? metric.benchmark.toFixed(2)
                      : metric.benchmark}
                  </span>
                </div>
                <Progress
                  value={
                    typeof metric.currentValue === "number" && typeof metric.benchmark === "number"
                      ? Math.min((metric.currentValue / metric.benchmark) * 100, 100)
                      : 75
                  }
                  className="h-2"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Risk Controls */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Active Risk Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskControls.map((control, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{control.control}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{control.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Implementation:</strong> {control.implementation}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{control.effectiveness}%</div>
                    <div className="text-xs text-muted-foreground">Effectiveness</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Progress value={control.effectiveness} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Risk Management Philosophy</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              "Risk comes from not knowing what you're doing. Our systematic approach uses quantitative models to
              measure, monitor, and manage risk at every level - from individual positions to portfolio construction. We
              believe in taking calculated risks, not blind ones."
            </p>
            <div className="mt-4 text-sm text-muted-foreground">- Sage</div>
          </Card>
        </div>
      </div>
    </section>
  )
}
