"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Youtube, Play, Calendar, Eye, ExternalLink, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount: string
  videoUrl: string
}

export function LatestEpisodeSection() {
  const [video, setVideo] = useState<YouTubeVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    fetchLatestVideo()
  }, [])

  const fetchLatestVideo = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
      const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

      if (!apiKey) {
        throw new Error("YouTube API key not configured")
      }

      // Get channel uploads playlist ID
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=${channelId?.replace("@", "")}&key=${apiKey}`
      )

      if (!channelResponse.ok) {
        // Try with channel handle format
        const handleResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelId}&type=channel&key=${apiKey}`
        )
        
        if (!handleResponse.ok) {
          throw new Error("Failed to fetch channel data")
        }

        const handleData = await handleResponse.json()
        if (handleData.items && handleData.items.length > 0) {
          const actualChannelId = handleData.items[0].snippet.channelId
          
          // Get latest video from this channel
          const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${actualChannelId}&order=date&type=video&maxResults=1&key=${apiKey}`
          )

          if (!videosResponse.ok) {
            throw new Error("Failed to fetch videos")
          }

          const videosData = await videosResponse.json()
          
          if (videosData.items && videosData.items.length > 0) {
            const latestVideo = videosData.items[0]
            const videoId = latestVideo.id.videoId

            // Get video statistics
            const statsResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${apiKey}`
            )

            if (statsResponse.ok) {
              const statsData = await statsResponse.json()
              const videoStats = statsData.items[0]

              setVideo({
                id: videoId,
                title: videoStats.snippet.title,
                description: videoStats.snippet.description.slice(0, 150) + "...",
                thumbnail: videoStats.snippet.thumbnails.maxres?.url || videoStats.snippet.thumbnails.high.url,
                publishedAt: new Date(videoStats.snippet.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                viewCount: parseInt(videoStats.statistics.viewCount).toLocaleString(),
                videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
              })
            }
          }
        }
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching YouTube video:", err)
      setError("Unable to load latest episode")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-br from-background via-card/10 to-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        </div>
      </section>
    )
  }

  if (error || !video) {
    return null // Silently fail if video can't be loaded
  }

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-card/10 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-red-500/10 text-red-400 border-red-500/20">
            <Youtube className="w-3 h-3 mr-1" />
            Latest Episode
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Watch Our Latest Content
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with our latest market analysis, trading strategies, and educational content
          </p>
        </motion.div>

        {/* Video Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Video Player / Thumbnail */}
              <div className="relative aspect-video lg:aspect-auto">
                {showVideo ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="relative w-full h-full group cursor-pointer" onClick={() => setShowVideo(true)}>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50 transition-all duration-300"
                      >
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </motion.div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white border-none">
                        <Youtube className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-8 lg:p-12 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                      {video.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{video.publishedAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{video.viewCount} views</span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white group">
                      <Youtube className="w-4 h-4 mr-2" />
                      Watch on YouTube
                      <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link
                    href="https://www.youtube.com/@NexuralTrading?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full border-red-500/20 text-foreground hover:bg-red-500/10">
                      Subscribe to Channel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Channel Promo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Youtube className="w-5 h-5 text-red-400" />
            <span className="text-sm">
              New videos every week covering market analysis, trading strategies & educational content
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
