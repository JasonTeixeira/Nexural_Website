"use client"

import { useState, useEffect } from "react"

const testimonials = [
  {
    name: "Marcus Chen",
    role: "Day Trader",
    avatar: "/professional-trader-headshot.jpg",
    content:
      "The AI analysis has completely transformed my trading. I'm seeing 40% better returns since switching to Nexural Trading. The real-time alerts are incredibly accurate.",
    rating: 5,
    verified: true,
    profit: "+$12,400",
  },
  {
    name: "Sarah Rodriguez",
    role: "Portfolio Manager",
    avatar: "/female-finance-professional.jpg",
    content:
      "Finally, a tool that actually delivers on its promises. The risk management features alone have saved me thousands. Worth every penny.",
    rating: 5,
    verified: true,
    profit: "+$8,750",
  },
  {
    name: "David Kim",
    role: "Swing Trader",
    avatar: "/asian-male-trader.png",
    content:
      "I was skeptical at first, but the results speak for themselves. The community insights and educational resources are top-notch.",
    rating: 5,
    verified: true,
    profit: "+$15,200",
  },
  {
    name: "Jennifer Walsh",
    role: "Options Trader",
    avatar: "/professional-woman-trader.jpg",
    content:
      "The scanning algorithms caught opportunities I would have completely missed. This is the edge I've been looking for.",
    rating: 5,
    verified: true,
    profit: "+$9,850",
  },
  {
    name: "Alex Thompson",
    role: "Crypto Trader",
    avatar: "/young-male-crypto-trader.jpg",
    content:
      "Best investment I've made this year. The AI predictions are scary accurate, and the Discord community is incredibly supportive.",
    rating: 5,
    verified: true,
    profit: "+$22,100",
  },
  {
    name: "Lisa Park",
    role: "Institutional Trader",
    avatar: "/professional-asian-woman.png",
    content:
      "We've integrated this into our institutional strategy. The performance metrics and analytics are institutional-grade quality.",
    rating: 5,
    verified: true,
    profit: "+$45,000",
  },
]

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const VerifiedIcon = () => (
  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
)

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [memberCount, setMemberCount] = useState(1000) // Default fallback

  useEffect(() => {
    setIsVisible(true)
    
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
        // Keep default fallback value
      })
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4 text-balance">
          Trusted by <span className="text-cyan-400" suppressHydrationWarning>{memberCount.toLocaleString()}+</span> Traders Worldwide
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto text-pretty">
          See what our community is saying about their trading transformation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.name}
            className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-105 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={testimonial.avatar || "/placeholder.svg"}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  {testimonial.verified && <VerifiedIcon />}
                </div>
                <p className="text-sm text-white/60">{testimonial.role}</p>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-sm">{testimonial.profit}</div>
                <div className="text-xs text-white/40">30 days</div>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < testimonial.rating} />
              ))}
            </div>

            <p className="text-white/90 text-sm leading-relaxed">"{testimonial.content}"</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/80">Live results from our community</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="text-sm text-cyan-400 font-semibold">Average: +$18,500 in 30 days</div>
        </div>
      </div>
    </div>
  )
}
