"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, FileText } from "lucide-react"
import type { BlogPost } from "@/lib/blog/blog-types"
import { formatDate, formatRelativeTime, truncateText } from "@/lib/blog/blog-utils"

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
  index?: number
}

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

export function BlogCard({ post, featured = false, index = 0 }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const cardSize = featured ? 'lg:col-span-2' : ''
  const imageHeight = featured ? 'h-96' : 'h-48'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block ${cardSize}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <article
        className={`
          relative overflow-hidden rounded-2xl border transition-all duration-500 h-full
          ${isHovered 
            ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-transparent shadow-2xl shadow-cyan-500/20 scale-[1.02] -translate-y-1' 
            : 'border-white/10 bg-card/30 hover:border-white/20'
          }
        `}
        style={{
          opacity: 1,
          transform: 'translateY(0)',
          transitionDelay: `${index * 100}ms`
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Glowing Border Effect */}
        {isHovered && (
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] animate-pulse" />
        )}

        {/* Featured Image */}
        {post.featured_image && !imageError ? (
          <div className={`relative ${imageHeight} overflow-hidden`}>
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Featured Badge */}
            {post.is_featured && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 backdrop-blur-sm flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>Featured</span>
              </div>
            )}
          </div>
        ) : (
          <div className={`relative ${imageHeight} bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center`}>
            <FileText className="h-16 w-16 text-white/50" />
            {post.is_featured && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 backdrop-blur-sm flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>Featured</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.slice(0, 2).map((category: any) => (
                <span
                  key={category.id}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 text-cyan-300"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className={`font-bold text-foreground group-hover:text-cyan-100 transition-colors mb-2 ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground group-hover:text-foreground/90 transition-colors mb-4 text-sm leading-relaxed">
              {truncateText(post.excerpt, featured ? 200 : 120)}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Date */}
            <div className="flex items-center gap-1">
              <span>{formatRelativeTime(post.published_at || post.created_at)}</span>
            </div>

            {/* Reading Time */}
            {post.reading_time && (
              <>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-1">
                  <ClockIcon />
                  <span>{post.reading_time} min read</span>
                </div>
              </>
            )}

            {/* Views */}
            {post.views > 0 && (
              <>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-1">
                  <EyeIcon />
                  <span>{post.views.toLocaleString()} views</span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              {post.tags.slice(0, 3).map((tag: any) => (
                <span
                  key={tag.id}
                  className="text-xs text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Read More Arrow */}
          <div className="mt-4 flex items-center gap-2 text-cyan-300 font-semibold group-hover:gap-3 transition-all">
            <span>Read More</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  )
}
