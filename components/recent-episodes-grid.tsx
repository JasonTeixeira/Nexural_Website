"use client"

import { motion } from "framer-motion"
import { Youtube, Play, Calendar, Eye, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Episode {
  id: string
  title: string
  thumbnail: string
  duration: string
  publishedAt: string
  viewCount: string
  videoUrl: string
}

// Dummy data for visualization
const DUMMY_EPISODES: Episode[] = [
  {
    id: "1",
    title: "Market Analysis: S&P 500 Breakout Strategy for November 2024",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
    duration: "15:23",
    publishedAt: "2 days ago",
    viewCount: "12.5K",
    videoUrl: "https://youtube.com/@NexuralTrading",
  },
  {
    id: "2",
    title: "Top 5 Futures Trading Setups This Week - High Probability Trades",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    duration: "22:45",
    publishedAt: "5 days ago",
    viewCount: "18.2K",
    videoUrl: "https://youtube.com/@NexuralTrading",
  },
  {
    id: "3",
    title: "Risk Management 101: How to Protect Your Trading Capital",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop",
    duration: "18:30",
    publishedAt: "1 week ago",
    viewCount: "24.1K",
    videoUrl: "https://youtube.com/@NexuralTrading",
  },
  {
    id: "4",
    title: "Live Trading Session: Catching the NQ Futures Morning Pump",
    thumbnail: "https://images.unsplash.com/photo-1642790551116-18e150f248e6?w=800&h=450&fit=crop",
    duration: "45:12",
    publishedAt: "1 week ago",
    viewCount: "31.4K",
    videoUrl: "https://youtube.com/@NexuralTrading",
  },
  {
    id: "5",
    title: "Technical Analysis Deep Dive: Understanding Support & Resistance",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    duration: "28:15",
    publishedAt: "2 weeks ago",
    viewCount: "19.8K",
    videoUrl: "https://youtube.com/@NexuralTrading",
  },
  {
    id: "6",
    title: "How I Made $12,000 Trading ES Futures - Full Breakdown",
    thumbnail: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=450&fit=crop",
    duration: "32:08",
    publishedAt: "2 weeks ago",
    viewCount: "42.7K",
    videoUrl: "https://youtube.com/@NexuralTrading",
  },
]

export function RecentEpisodesGrid() {
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Youtube className="w-3 h-3 mr-1" />
            Binge Watch
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Recent Episodes
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Catch up on our latest market analysis, trading strategies, and educational content
          </p>
        </motion.div>

        {/* Episodes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {DUMMY_EPISODES.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={episode.videoUrl} target="_blank" rel="noopener noreferrer">
                <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-blue-500/30 transition-all duration-300 group cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={episode.thumbnail}
                      alt={episode.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50"
                      >
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                      </motion.div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-black/80 text-white border-none text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {episode.duration}
                      </Badge>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors leading-snug">
                      {episode.title}
                    </h3>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{episode.viewCount} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{episode.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="https://www.youtube.com/@NexuralTrading?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
          >
            <Youtube className="w-5 h-5" />
            View All Episodes on YouTube
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Subscribe for weekly market analysis and trading insights
          </p>
        </motion.div>
      </div>
    </section>
  )
}
