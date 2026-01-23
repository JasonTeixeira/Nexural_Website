"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const PlayIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg
    className={`w-4 h-4 ${filled ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
)

const QuoteIcon = () => (
  <svg className="w-8 h-8 text-cyan-400/30" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
)

interface VideoTestimonial {
  id: string
  name: string
  role: string
  thumbnail: string
  videoUrl: string
  quote: string
  memberSince: string
  result: string
}

interface MemberCard {
  id: string
  name: string
  avatar: string
  role: string
  memberSince: string
  rating: number
  testimonial: string
  result: string
  verified: boolean
}

const videoTestimonials: VideoTestimonial[] = [
  {
    id: "1",
    name: "Michael Chen",
    role: "Software Engineer",
    thumbnail: "/testimonials/michael-thumb.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    quote: "Nexural's AI picks helped me grow my portfolio 47% in 6 months",
    memberSince: "Jan 2024",
    result: "+47% Portfolio Growth",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    role: "Marketing Director",
    thumbnail: "/testimonials/sarah-thumb.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    quote: "The Discord community alone is worth 10x the subscription price",
    memberSince: "Mar 2024",
    result: "+32% in 4 Months",
  },
  {
    id: "3",
    name: "David Rodriguez",
    role: "Financial Analyst",
    thumbnail: "/testimonials/david-thumb.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    quote: "Best investment education I've ever received. Period.",
    memberSince: "Nov 2023",
    result: "+68% YTD",
  },
]

const memberCards: MemberCard[] = [
  {
    id: "1",
    name: "Alex Thompson",
    avatar: "AT",
    role: "Day Trader",
    memberSince: "Dec 2023",
    rating: 5,
    testimonial:
      "The 80/20 approach changed everything. I'm building wealth steadily while learning active trading. The AI insights are incredible.",
    result: "+52% Portfolio",
    verified: true,
  },
  {
    id: "2",
    name: "Jessica Martinez",
    avatar: "JM",
    role: "Investor",
    memberSince: "Feb 2024",
    rating: 5,
    testimonial:
      "Finally, a service that doesn't overpromise. Real education, real community, real results. Worth every penny.",
    result: "+38% in 6 Months",
    verified: true,
  },
  {
    id: "3",
    name: "Ryan Park",
    avatar: "RP",
    role: "Tech Professional",
    memberSince: "Jan 2024",
    rating: 5,
    testimonial:
      "The daily market analysis and Discord community are game-changers. I've learned more in 3 months than 3 years on my own.",
    result: "+41% Growth",
    verified: true,
  },
  {
    id: "4",
    name: "Emily Watson",
    avatar: "EW",
    role: "Business Owner",
    memberSince: "Oct 2023",
    rating: 5,
    testimonial:
      "Sage's systematic approach to investing is exactly what I needed. No hype, just solid strategies that work.",
    result: "+59% YTD",
    verified: true,
  },
]

export function SocialProofSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [totalMembers, setTotalMembers] = useState(1000) // Default fallback

  useEffect(() => {
    // Fetch real Discord member count
    fetch('/api/discord/stats')
      .then(res => res.json())
      .then(data => {
        if (data.memberCount > 0) {
          setTotalMembers(data.memberCount)
        }
      })
      .catch(error => {
        console.error('Failed to fetch Discord stats:', error)
        // Keep default fallback value
      })
  }, [])

  useEffect(() => {
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % videoTestimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20" suppressHydrationWarning>
            Trusted by {totalMembers.toLocaleString()}+ Investors
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Real Members,{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Real Results
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of investors who are building wealth with our proven 80/20 system
          </p>

          {/* Live Member Counter */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-full px-6 py-3"
          >
            <div className="flex -space-x-2">
              {["AT", "JM", "RP", "EW"].map((initial, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white border-2 border-background"
                >
                  {initial}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-cyan-400" suppressHydrationWarning>
                {totalMembers.toLocaleString()}+
              </div>
              <div className="text-xs text-muted-foreground">Active Members</div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Video Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-8 items-center"
              >
                {/* Video Player */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 group">
                  <div className="aspect-video relative">
                    {activeVideo === videoTestimonials[currentTestimonial].id ? (
                      <iframe
                        src={videoTestimonials[currentTestimonial].videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            onClick={() => setActiveVideo(videoTestimonials[currentTestimonial].id)}
                            className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl shadow-cyan-500/50 transform hover:scale-110 transition-all duration-300"
                          >
                            <PlayIcon />
                          </Button>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <Badge className="mb-2 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                            Video Testimonial
                          </Badge>
                          <h3 className="text-xl font-bold text-white">
                            {videoTestimonials[currentTestimonial].name}
                          </h3>
                          <p className="text-sm text-white/80">
                            {videoTestimonials[currentTestimonial].role}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Testimonial Content */}
                <div className="space-y-6">
                  <QuoteIcon />
                  <blockquote className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                    "{videoTestimonials[currentTestimonial].quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} filled={true} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">5.0 out of 5</span>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <div>
                      <div className="font-semibold text-foreground">
                        {videoTestimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Member since {videoTestimonials[currentTestimonial].memberSince}
                      </div>
                    </div>
                    <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20">
                      {videoTestimonials[currentTestimonial].result}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="flex justify-center gap-2 mt-8">
              {videoTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "w-8 bg-gradient-to-r from-cyan-500 to-blue-600"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Member Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            What Our <span className="text-cyan-400">Community</span> Says
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberCards.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate">{member.name}</h4>
                        {member.verified && (
                          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(member.rating)].map((_, i) => (
                          <StarIcon key={i} filled={true} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-4 group-hover:line-clamp-none transition-all">
                    {member.testimonial}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Since {member.memberSince}</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                      {member.result}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6" suppressHydrationWarning>
            Join {totalMembers.toLocaleString()}+ investors building wealth with Nexural
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
          >
            Start Your Journey Today
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
