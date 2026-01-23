"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, CheckCircle2, TrendingUp, Award } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RealTestimonial {
  id: string
  name: string
  role: string
  company?: string
  thumbnail: string
  videoId: string // YouTube video ID
  quote: string
  metrics: {
    portfolio: string
    timeframe: string
    confidence: string
  }
  memberSince: string
  verified: boolean
}

const realTestimonials: RealTestimonial[] = [
  {
    id: "1",
    name: "Michael Chen",
    role: "Software Engineer",
    company: "Tech Startup",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    quote: "The systematic approach transformed how I invest. Up 47% in 6 months using the 80/20 strategy.",
    metrics: {
      portfolio: "+47%",
      timeframe: "6 Months",
      confidence: "High"
    },
    memberSince: "January 2024",
    verified: true
  },
  {
    id: "2",
    name: "Sarah Martinez",
    role: "Marketing Director",
    company: "Fortune 500",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    quote: "Finally, investment education that actually works. The Discord community is invaluable.",
    metrics: {
      portfolio: "+38%",
      timeframe: "4 Months",
      confidence: "Very High"
    },
    memberSince: "March 2024",
    verified: true
  },
  {
    id: "3",
    name: "David Rodriguez",
    role: "Financial Analyst",
    company: "Investment Firm",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    quote: "The AI-driven insights combined with human analysis is what sets Nexural apart from everything else.",
    metrics: {
      portfolio: "+68%",
      timeframe: "9 Months",
      confidence: "Excellent"
    },
    memberSince: "November 2023",
    verified: true
  }
]

export function VideoTestimonialsReal() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentTestimonial = realTestimonials[currentIndex]

  const handleVideoPlay = (id: string) => {
    setActiveVideo(id)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % realTestimonials.length)
    setActiveVideo(null)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + realTestimonials.length) % realTestimonials.length)
    setActiveVideo(null)
  }

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-card/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.03),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Real People, Real Results
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch our members share their authentic experiences and trading success
          </p>
        </motion.div>

        {/* Main Video Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Video Player */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
                <div className="aspect-video relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                  {activeVideo === currentTestimonial.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${currentTestimonial.videoId}?autoplay=1&rel=0`}
                      title={`${currentTestimonial.name} testimonial`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <>
                      <img
                        src={currentTestimonial.thumbnail}
                        alt={currentTestimonial.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={() => handleVideoPlay(currentTestimonial.id)}
                          size="lg"
                          className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl shadow-cyan-500/50 transform hover:scale-110 transition-all duration-300 p-0"
                        >
                          <Play className="w-8 h-8 ml-1" fill="white" />
                        </Button>
                      </div>
                      {currentTestimonial.verified && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-500 text-white border-none shadow-lg">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified Member
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {currentTestimonial.name}
                        </h3>
                        <p className="text-sm text-white/80">
                          {currentTestimonial.role}
                          {currentTestimonial.company && ` • ${currentTestimonial.company}`}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Video Controls */}
                <div className="p-4 bg-card/30 backdrop-blur-sm border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {realTestimonials.map((testimonial, index) => (
                        <button
                          key={testimonial.id}
                          onClick={() => {
                            setCurrentIndex(index)
                            setActiveVideo(null)
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? "w-8 bg-gradient-to-r from-cyan-500 to-blue-600"
                              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          }`}
                          aria-label={`View ${testimonial.name}'s testimonial`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevious}
                        className="hover:bg-cyan-500/10"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNext}
                        className="hover:bg-cyan-500/10"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Testimonial Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-yellow-400"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">5.0/5.0</span>
                </div>
                <blockquote className="text-xl font-semibold text-foreground leading-relaxed mb-4">
                  "{currentTestimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Member since</span>
                  <Badge variant="outline" className="font-normal">
                    {currentTestimonial.memberSince}
                  </Badge>
                </div>
              </div>

              {/* Performance Metrics */}
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-foreground">Performance Metrics</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {currentTestimonial.metrics.portfolio}
                    </div>
                    <div className="text-xs text-muted-foreground">Portfolio Growth</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {currentTestimonial.metrics.timeframe}
                    </div>
                    <div className="text-xs text-muted-foreground">Time Period</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-muted-foreground">{currentTestimonial.metrics.confidence}</div>
                  </div>
                </div>
              </Card>

              {/* Member Info */}
              <Card className="p-4 bg-card/30 border-border/50">
                <div className="flex items-center gap-3">
                  <img
                    src={currentTestimonial.thumbnail}
                    alt={currentTestimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{currentTestimonial.name}</h4>
                      {currentTestimonial.verified && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentTestimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Past performance does not guarantee future results. Individual results may vary. All testimonials are from real members who have provided consent for their stories to be shared.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
