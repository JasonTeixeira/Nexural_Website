"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Portfolio Manager",
    company: "Goldman Sachs",
    image: "/professional-woman-diverse.png",
    rating: 5,
    text: "Nexural's AI analysis helped me identify NVDA before its 300% run. The insights are incredibly detailed and actionable.",
    result: "+47% returns",
    verified: true,
  },
  {
    name: "Michael Rodriguez",
    role: "Retail Investor",
    company: "Self-Employed",
    image: "/professional-man.png",
    rating: 5,
    text: "I've been using their Discord community for 6 months. The real-time alerts and analysis have transformed my trading.",
    result: "+34% returns",
    verified: true,
  },
  {
    name: "Jennifer Park",
    role: "Financial Advisor",
    company: "Morgan Stanley",
    image: "/professional-woman-advisor.png",
    rating: 5,
    text: "The risk assessment framework is outstanding. My clients have seen consistent gains following their recommendations.",
    result: "+28% returns",
    verified: true,
  },
  {
    name: "David Thompson",
    role: "Day Trader",
    company: "Independent",
    image: "/professional-trader.png",
    rating: 5,
    text: "Best stock analysis service I've used. The AI picks are spot-on and the community support is incredible.",
    result: "+52% returns",
    verified: true,
  },
  {
    name: "Lisa Wang",
    role: "Investment Analyst",
    company: "Fidelity",
    image: "/professional-woman-analyst.jpg",
    rating: 5,
    text: "Their growth formula methodology is revolutionary. I've recommended it to all my colleagues.",
    result: "+41% returns",
    verified: true,
  },
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">SUCCESS STORIES</Badge>
          <h2 className="text-3xl font-bold mb-4">What Our Investors Say</h2>
          <p className="text-muted-foreground text-lg">
            Real results from real investors using our AI-powered analysis.
          </p>
        </div>

        <div className="relative">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={currentTestimonial.image || "/placeholder.svg"}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{currentTestimonial.name}</h3>
                    {currentTestimonial.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {currentTestimonial.role} at {currentTestimonial.company}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">{currentTestimonial.result}</Badge>
              </div>
            </div>

            <blockquote className="text-lg leading-relaxed mb-6">"{currentTestimonial.text}"</blockquote>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index)
                      setIsAutoPlaying(false)
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevTestimonial} className="w-8 h-8 p-0 bg-transparent">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextTestimonial} className="w-8 h-8 p-0 bg-transparent">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Join 2,500+ investors who trust Nexural Trading for their investment decisions
          </p>
        </div>
      </div>
    </section>
  )
}
