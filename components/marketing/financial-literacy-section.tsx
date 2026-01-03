"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function FinancialLiteracySection() {
  const courses = [
    {
      title: "Quantitative Analysis Fundamentals",
      duration: "4 weeks",
      level: "Beginner",
      sessions: 8,
      topics: [
        "Financial statement analysis",
        "Ratio analysis and interpretation",
        "Cash flow modeling",
        "Valuation methodologies",
      ],
      instructor: "Dr. Sarah Mitchell, CFA",
      nextStart: "January 15, 2025",
      enrolled: 156,
    },
    {
      title: "Advanced Risk Management",
      duration: "6 weeks",
      level: "Intermediate",
      sessions: 12,
      topics: [
        "Portfolio theory and optimization",
        "Value at Risk (VaR) calculations",
        "Monte Carlo simulations",
        "Derivatives for hedging",
      ],
      instructor: "Prof. Michael Chen, FRM",
      nextStart: "February 1, 2025",
      enrolled: 89,
    },
    {
      title: "Algorithmic Trading Strategies",
      duration: "8 weeks",
      level: "Advanced",
      sessions: 16,
      topics: [
        "Statistical arbitrage",
        "Mean reversion strategies",
        "Momentum and trend following",
        "Machine learning applications",
      ],
      instructor: "Sage Thompson, Quant Developer",
      nextStart: "February 15, 2025",
      enrolled: 67,
    },
  ]

  const weeklyTopics = [
    {
      week: "This Week",
      topic: "Understanding Market Volatility",
      description: "Learn how to measure and interpret market volatility using statistical methods",
      date: "December 18, 2024",
      time: "7:00 PM EST",
      duration: "90 minutes",
    },
    {
      week: "Next Week",
      topic: "Options Pricing Models",
      description: "Deep dive into Black-Scholes and binomial models for options valuation",
      date: "December 25, 2024",
      time: "7:00 PM EST",
      duration: "90 minutes",
    },
    {
      week: "Week 3",
      topic: "Portfolio Rebalancing Strategies",
      description: "Systematic approaches to maintaining optimal portfolio allocation",
      date: "January 1, 2025",
      time: "7:00 PM EST",
      duration: "90 minutes",
    },
  ]

  const resources = [
    {
      type: "Research Library",
      count: "500+",
      description: "Academic papers and industry research",
    },
    {
      type: "Video Tutorials",
      count: "200+",
      description: "Step-by-step educational content",
    },
    {
      type: "Excel Models",
      count: "50+",
      description: "Downloadable financial models",
    },
    {
      type: "Python Scripts",
      count: "100+",
      description: "Quantitative analysis code examples",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Financial Education Hub</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Comprehensive courses and resources to enhance your trading knowledge and skills
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <Card key={index} className="p-6 bg-gray-900/50 border-gray-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-teal-400 border-teal-400">
                  {course.level}
                </Badge>
                <span className="text-sm text-gray-400">{course.duration}</span>
              </div>
              
              <h3 className="text-xl font-semibold">{course.title}</h3>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Topics covered:</p>
                <ul className="text-sm space-y-1">
                  {course.topics.map((topic, i) => (
                    <li key={i} className="text-gray-300">• {topic}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">Instructor: {course.instructor}</p>
                <p className="text-sm text-gray-400">Next start: {course.nextStart}</p>
                <p className="text-sm text-teal-400">{course.enrolled} enrolled</p>
              </div>
              
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-black">
                Enroll Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
