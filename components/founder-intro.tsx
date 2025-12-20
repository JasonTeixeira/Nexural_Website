"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const PlayIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

interface FounderIntroProps {
  variant?: "hero" | "inline"
  showVideo?: boolean
}

export function FounderIntro({ variant = "inline", showVideo = true }: FounderIntroProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [imageError, setImageError] = useState(false)

  const credentials = [
    "14+ Years Trading Experience",
    "50+ Automated Systems Built",
    "50+ Custom Indicators Created",
    "Developer & Trader",
    "AI/ML Implementation Expert",
  ]

  if (variant === "hero") {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.08),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Photo/Video */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 group">
                <div className="aspect-[4/5] relative">
                  {showVideo && isVideoPlaying ? (
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      {/* Founder Photo */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {!imageError ? (
                          <img
                            src="/founder/sage-photo.jpg"
                            alt="Sage - Founder of Nexural Trading"
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/30">
                            <div className="text-center">
                              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-6xl font-bold text-white">
                                S
                              </div>
                              <p className="text-white/80 text-sm">Sage - Founder</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video Play Button Overlay */}
                      {showVideo && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            onClick={() => setIsVideoPlaying(true)}
                            className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl shadow-cyan-500/50 transform hover:scale-110 transition-all duration-300"
                          >
                            <PlayIcon />
                          </Button>
                        </div>
                      )}

                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-br from-cyan-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude" }} />
                    </>
                  )}
                </div>

                {/* Floating Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 backdrop-blur-sm text-white border-0 shadow-lg">
                    Founder & Lead Trader
                  </Badge>
                </div>
              </Card>

              {/* Watch Video CTA */}
              {showVideo && !isVideoPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-4 text-center"
                >
                  <Button
                    variant="outline"
                    onClick={() => setIsVideoPlaying(true)}
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400"
                  >
                    <div className="flex items-center gap-2">
                      <PlayIcon />
                      <span>Watch My Story (2 min)</span>
                    </div>
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                Meet the Founder
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Hi, I'm{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Sage
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                I've spent 14 years turning market complexity into systematic advantage through{" "}
                <span className="text-cyan-400 font-semibold">quantified analysis</span>,{" "}
                <span className="text-blue-400 font-semibold">automation</span>, and{" "}
                <span className="text-purple-400 font-semibold">AI</span>.
              </p>

              <div className="space-y-3">
                {credentials.map((credential, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckIcon />
                    </div>
                    <span className="text-foreground font-medium">{credential}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-6">
                <blockquote className="border-l-4 border-cyan-500 pl-6 italic text-lg text-muted-foreground">
                  "The market rewards those who combine deep analytical thinking with systematic execution. 
                  Technology amplifies human insight—it doesn't replace it."
                </blockquote>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  Join My Community
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400"
                >
                  Read My Story
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  // Inline variant for About page
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Photo/Video */}
        <div className="relative group">
          <div className="aspect-square relative rounded-xl overflow-hidden">
            {showVideo && isVideoPlaying ? (
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                {!imageError ? (
                  <img
                    src="/founder/sage-photo.jpg"
                    alt="Sage - Founder"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/30">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-5xl font-bold text-white">
                      S
                    </div>
                  </div>
                )}

                {showVideo && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      onClick={() => setIsVideoPlaying(true)}
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl shadow-cyan-500/50"
                    >
                      <PlayIcon />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 backdrop-blur-sm text-white border-0">
            Founder
          </Badge>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center space-y-4">
          <h3 className="text-3xl font-bold">
            <span className="text-cyan-400">Sage</span> - Founder & Lead Trader
          </h3>
          <p className="text-muted-foreground">
            14 years of systematic trading experience combined with software development expertise to create 
            institutional-grade tools for retail investors.
          </p>
          <div className="space-y-2">
            {credentials.slice(0, 3).map((credential, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <CheckIcon />
                </div>
                <span className="text-sm text-foreground">{credential}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
