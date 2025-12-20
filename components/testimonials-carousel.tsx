"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

// Real testimonial screenshots from your customers
const testimonials = [
  {
    id: 1,
    image: "/test1.jpg",
    alt: "Customer Testimonial 1"
  },
  {
    id: 2,
    image: "/test2.jpg",
    alt: "Customer Testimonial 2"
  },
  {
    id: 3,
    image: "/test3.jpg",
    alt: "Customer Testimonial 3"
  },
  {
    id: 4,
    image: "/test4.jpg",
    alt: "Customer Testimonial 4"
  },
  {
    id: 5,
    image: "/test5.jpg",
    alt: "Customer Testimonial 5"
  },
  {
    id: 6,
    image: "/test6.jpg",
    alt: "Customer Testimonial 6"
  },
  {
    id: 7,
    image: "/test7.jpg",
    alt: "Customer Testimonial 7"
  },
  {
    id: 8,
    image: "/test8.jpg",
    alt: "Customer Testimonial 8"
  },
  {
    id: 9,
    image: "/test9.jpg",
    alt: "Customer Testimonial 9"
  },
  {
    id: 10,
    image: "/test10.jpg",
    alt: "Customer Testimonial 10"
  },
  {
    id: 11,
    image: "/test11.jpg",
    alt: "Customer Testimonial 11"
  },
  {
    id: 12,
    image: "/test12.jpg",
    alt: "Customer Testimonial 12"
  },
  {
    id: 13,
    image: "/test13.jpg",
    alt: "Customer Testimonial 13"
  },
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [memberCount, setMemberCount] = useState(1000)

  useEffect(() => {
    // Fetch real Discord member count
    fetch('/api/discord/stats')
      .then(res => res.json())
      .then(data => {
        if (data.memberCount > 0) {
          setMemberCount(data.memberCount)
        }
      })
      .catch(error => {
        console.error('Failed to fetch Discord stats:', error)
      })
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Real Testimonials from Our Community
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Trusted by {memberCount.toLocaleString()}+ traders worldwide
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-5xl mx-auto px-4">
        {/* Main Carousel */}
        <div className="relative overflow-hidden rounded-3xl">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="min-w-full px-4"
              >
                <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4 md:p-8 shadow-2xl">
                  {/* Testimonial Screenshot */}
                  <div className="relative w-full flex items-center justify-center bg-black/20 rounded-xl" style={{ minHeight: '400px' }}>
                    <img
                      src={testimonial.image}
                      alt={testimonial.alt}
                      className="rounded-xl object-contain w-full h-auto max-h-[600px]"
                      loading={testimonial.id <= 3 ? "eager" : "lazy"}
                      onError={(e) => {
                        console.error(`Failed to load image: ${testimonial.image}`)
                        e.currentTarget.style.display = 'none'
                      }}
                      onLoad={(e) => {
                        console.log(`Successfully loaded: ${testimonial.image}`)
                        e.currentTarget.style.opacity = '1'
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => {
            prevSlide()
            setIsAutoPlaying(false)
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-card/90 hover:bg-card border border-border hover:border-cyan-500/50 rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg z-10"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <button
          onClick={() => {
            nextSlide()
            setIsAutoPlaying(false)
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-card/90 hover:bg-card border border-border hover:border-cyan-500/50 rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg z-10"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "bg-cyan-500 w-8 h-3"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-3 h-3"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isAutoPlaying ? "⏸ Pause" : "▶ Play"} Auto-scroll
          </button>
        </div>

        {/* Counter */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Testimonial {currentIndex + 1} of {testimonials.length}
          </p>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="text-center mt-12">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-2xl px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Real testimonials from our trading community</span>
          </div>
        </div>
      </div>
    </div>
  )
}
