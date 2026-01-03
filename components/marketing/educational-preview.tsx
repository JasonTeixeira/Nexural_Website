"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Video, FileText, Users, Calendar, TrendingUp } from "lucide-react"

export function EducationalPreview() {
  const [activeTab, setActiveTab] = useState("analysis")

  const educationalContent = {
    analysis: {
      title: "Weekly Market Analysis",
      description: "Deep-dive analysis of market trends and AI-selected opportunities",
      content: {
        title: "This Week: Tech Sector Rotation Analysis",
        date: "January 15, 2025",
        preview:
          "Our ensemble AI model has identified a significant rotation pattern in the technology sector, with particular strength in cloud infrastructure and cybersecurity subsectors. The quantitative analysis reveals...",
        keyPoints: [
          "Cloud infrastructure stocks showing 15% relative strength",
          "Cybersecurity sector momentum indicators at 3-month highs",
          "AI-driven earnings revision trends favoring enterprise software",
          "Risk-adjusted opportunity score: 8.2/10",
        ],
      },
    },
    formulas: {
      title: "Investment Formulas & Models",
      description: "The mathematical foundations behind our AI analysis",
      content: {
        title: "Ensemble Risk-Adjusted Return Formula",
        formula: "ERAR = (Σ(wi × Ri) - Rf) / σp × √(1 + Sharpe_AI)",
        explanation:
          "Our proprietary formula combines weighted returns, risk-free rate, portfolio volatility, and AI-enhanced Sharpe ratio to identify optimal risk-adjusted opportunities.",
        components: [
          "wi = AI-weighted allocation based on confidence score",
          "Ri = Expected return from fundamental + technical analysis",
          "σp = Portfolio volatility adjusted for correlation matrix",
          "Sharpe_AI = Traditional Sharpe ratio enhanced with ML predictions",
        ],
      },
    },
    classes: {
      title: "Live Educational Sessions",
      description: "Interactive learning with financial experts and AI researchers",
      content: {
        title: "Upcoming Sessions This Week",
        sessions: [
          {
            title: "Quantitative Risk Management",
            instructor: "Dr. Sarah Kim, PhD Finance",
            date: "Wednesday, 7:00 PM EST",
            duration: "90 minutes",
            topics: ["Portfolio optimization", "VaR calculations", "Monte Carlo simulations"],
          },
          {
            title: "AI in Financial Analysis",
            instructor: "Michael Chen, ML Engineer",
            date: "Friday, 8:00 PM EST",
            duration: "60 minutes",
            topics: ["Ensemble models", "Feature engineering", "Backtesting strategies"],
          },
        ],
      },
    },
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Educational Resources Preview</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a glimpse of the comprehensive educational content and analysis you'll receive as a member.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <Button
            variant={activeTab === "analysis" ? "default" : "outline"}
            onClick={() => setActiveTab("analysis")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Market Analysis
          </Button>
          <Button
            variant={activeTab === "formulas" ? "default" : "outline"}
            onClick={() => setActiveTab("formulas")}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Formulas & Models
          </Button>
          <Button
            variant={activeTab === "classes" ? "default" : "outline"}
            onClick={() => setActiveTab("classes")}
            className="flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Live Classes
          </Button>
        </div>

        {activeTab === "analysis" && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {educationalContent.analysis.title}
              </CardTitle>
              <CardDescription>{educationalContent.analysis.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {educationalContent.analysis.content.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Published: {educationalContent.analysis.content.date}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {educationalContent.analysis.content.preview}
                </p>

                <div className="bg-muted/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Key Analysis Points:</h4>
                  <ul className="space-y-2">
                    {educationalContent.analysis.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Access Full Analysis Library
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "formulas" && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {educationalContent.formulas.title}
              </CardTitle>
              <CardDescription>{educationalContent.formulas.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {educationalContent.formulas.content.title}
                </h3>

                <div className="bg-slate-900 rounded-lg p-4 mb-6 text-green-400 text-center text-lg">
                  {educationalContent.formulas.content.formula}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {educationalContent.formulas.content.explanation}
                </p>

                <div className="bg-muted/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Formula Components:</h4>
                  <ul className="space-y-2">
                    {educationalContent.formulas.content.components.map((component, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {component}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Access Complete Formula Library
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "classes" && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {educationalContent.classes.title}
              </CardTitle>
              <CardDescription>{educationalContent.classes.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {educationalContent.classes.content.sessions.map((session, index) => (
                  <div key={index} className="border border-border/50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">Instructor: {session.instructor}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-1">
                          <Calendar className="w-4 h-4" />
                          {session.date}
                        </div>
                        <p className="text-sm text-muted-foreground">{session.duration}</p>
                      </div>
                    </div>

                    <div className="bg-muted/20 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Topics Covered:</h4>
                      <div className="flex flex-wrap gap-2">
                        {session.topics.map((topic, topicIndex) => (
                          <span key={topicIndex} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Join Live Educational Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
