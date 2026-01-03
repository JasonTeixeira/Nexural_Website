"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Star, Quote } from "lucide-react"

export function VideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "Portfolio Manager",
      company: "Meridian Capital",
      thumbnail: "/professional-woman-financial-advisor.png",
      videoPlaceholder: "Video testimonial from Sarah Chen discussing 34% portfolio growth using Nexural's AI analysis",
      quote:
        "Nexural's AI analysis helped me identify undervalued growth stocks that delivered 34% returns in 8 months.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      title: "Independent Trader",
      company: "15 years experience",
      thumbnail: "/professional-man-trader-financial-markets.jpg",
      videoPlaceholder: "Video testimonial from Michael Rodriguez about risk management and consistent profits",
      quote:
        "The risk management formulas alone have saved me from major losses. Best investment education I've found.",
      rating: 5,
    },
    {
      id: 3,
      name: "Jennifer Park",
      title: "Wealth Advisor",
      company: "Park Financial Group",
      thumbnail: "/professional-asian-woman-financial-advisor.jpg",
      videoPlaceholder: "Video testimonial from Jennifer Park about client portfolio improvements",
      quote:
        "My clients' portfolios have consistently outperformed benchmarks since implementing Nexural's strategies.",
      rating: 5,
    },
  ]

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Financial Professionals Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from portfolio managers, traders, and advisors who use our AI analysis to enhance their investment
            decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={testimonial.thumbnail || "/placeholder.svg"}
                  alt={`${testimonial.name} testimonial`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="lg"
                    className="bg-primary/90 hover:bg-primary text-white rounded-full"
                    onClick={() => setActiveVideo(testimonial.id)}
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Play Video
                  </Button>
                </div>
                <div className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">{testimonial.rating}.0</span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground italic leading-relaxed">"{testimonial.quote}"</p>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Modal Placeholder */}
        {activeVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg p-6 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-foreground">Video Testimonial</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveVideo(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              <div className="bg-muted/20 rounded-lg p-8 text-center">
                <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {testimonials.find((t) => t.id === activeVideo)?.videoPlaceholder}
                </p>
                <p className="text-sm text-muted-foreground">
                  Video placeholder - You'll add the actual video content here
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
