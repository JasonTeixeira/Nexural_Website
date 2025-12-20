import { getPostBySlug, getRelatedPosts } from "@/lib/blog/blog-queries"
import { formatDate, generateSeoTitle, generateMetaDescription } from "@/lib/blog/blog-utils"
import { BlogCard } from "@/components/blog/blog-card"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostBySlug(params.slug)
    return {
      title: generateSeoTitle(post.title),
      description: generateMetaDescription(post.content, post.excerpt || undefined),
    }
  } catch {
    return {
      title: 'Post Not Found | Nexural Trading',
      description: 'The requested blog post could not be found.',
    }
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post
  try {
    post = await getPostBySlug(params.slug)
  } catch {
    notFound()
  }

  // Get related posts
  const categoryIds = post.categories?.map((c: any) => c.id) || []
  const relatedPosts = await getRelatedPosts(post.id, categoryIds, 3).catch(() => [])

  return (
    <div className="min-h-screen hero-gradient">
      {/* Hero Section with Featured Image */}
      <section className="relative overflow-hidden w-full pt-32 pb-12">
        {post.featured_image && (
          <div className="absolute inset-0">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-cyan-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-cyan-300 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground">{post.title}</span>
          </div>

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 text-cyan-300 hover:border-cyan-500/40 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-white/80 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                NT
              </div>
              <span className="text-foreground">Nexural Trading</span>
            </div>
            <span className="text-white/20">•</span>
            <span>{formatDate(post.published_at || post.created_at)}</span>
            {post.reading_time && (
              <>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-1">
                  <ClockIcon />
                  <span>{post.reading_time} min read</span>
                </div>
              </>
            )}
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
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-invert prose-lg max-w-none">
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="px-3 py-1 rounded-full text-sm bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-cyan-300 transition-colors border border-white/10"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-foreground mb-4">Share this article</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors border border-white/10">
                Twitter
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors border border-white/10">
                LinkedIn
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors border border-white/10">
                Facebook
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors border border-white/10">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-card/30 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Related Articles
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <BlogCard key={relatedPost.id} post={relatedPost} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Ready to Level Up Your Trading?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community for daily insights, live trading room, and expert guidance.
            </p>
            <a
              href="https://discord.gg/fTS3Nedk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Join FREE Community
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
