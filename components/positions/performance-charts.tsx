"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"

export function PerformanceCharts() {
  const [activeChart, setActiveChart] = useState("returns")

  const performanceData = {
    returns: {
      title: "Historical Returns Analysis",
      description: "Comparison of our AI-selected portfolio vs market benchmarks",
      data: [
        { period: "2024 YTD", nexural: 23.4, sp500: 11.2, nasdaq: 8.9 },
        { period: "2023", nexural: 31.7, sp500: 24.2, nasdaq: 43.4 },
        { period: "2022", nexural: -8.3, sp500: -19.4, nasdaq: -33.1 },
        { period: "2021", nexural: 42.1, sp500: 26.9, nasdaq: 21.4 },
      ],
    },
    accuracy: {
      title: "Pick Accuracy Metrics",
      description: "Success rate of our AI-powered stock selections",
      data: [
        { metric: "Winning Picks", value: "68%", benchmark: "52%" },
        { metric: "Avg Hold Period", value: "4.2 months", benchmark: "6+ months" },
        { metric: "Risk-Adjusted Return", value: "1.84", benchmark: "1.12" },
        { metric: "Max Drawdown", value: "-12.3%", benchmark: "-22.1%" },
      ],
    },
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Proven Track Record</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered analysis has consistently outperformed market benchmarks through rigorous quantitative
            methods and risk management.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={activeChart === "returns" ? "default" : "outline"}
            onClick={() => setActiveChart("returns")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Returns Analysis
          </Button>
          <Button
            variant={activeChart === "accuracy" ? "default" : "outline"}
            onClick={() => setActiveChart("accuracy")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Accuracy Metrics
          </Button>
        </div>

        {activeChart === "returns" && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {performanceData.returns.title}
              </CardTitle>
              <CardDescription>{performanceData.returns.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceData.returns.data.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{item.period}</span>
                      <div className="flex gap-6 text-sm">
                        <span className="text-primary font-semibold">
                          Nexural: {item.nexural > 0 ? "+" : ""}
                          {item.nexural}%
                        </span>
                        <span className="text-muted-foreground">
                          S&P 500: {item.sp500 > 0 ? "+" : ""}
                          {item.sp500}%
                        </span>
                        <span className="text-muted-foreground">
                          NASDAQ: {item.nasdaq > 0 ? "+" : ""}
                          {item.nasdaq}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 h-2">
                      <div
                        className="bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${Math.abs(item.nexural) * 2}px`, minWidth: "4px" }}
                      />
                      <div
                        className="bg-muted rounded-full transition-all duration-1000"
                        style={{ width: `${Math.abs(item.sp500) * 2}px`, minWidth: "4px" }}
                      />
                      <div
                        className="bg-muted-foreground/30 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.abs(item.nasdaq) * 2}px`, minWidth: "4px" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Methodology:</strong> Returns calculated using our ensemble AI model combining fundamental
                  analysis, technical indicators, and quantitative risk metrics. All figures are net of simulated
                  trading costs.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeChart === "accuracy" && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                {performanceData.accuracy.title}
              </CardTitle>
              <CardDescription>{performanceData.accuracy.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {performanceData.accuracy.data.map((item, index) => (
                  <div key={index} className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-foreground">{item.metric}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">{item.value}</span>
                      <span className="text-sm text-muted-foreground">vs {item.benchmark} market avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Past performance does not guarantee future results. All investments carry risk of loss.
          </p>
        </div>
      </div>
    </section>
  )
}
