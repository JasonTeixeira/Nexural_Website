// Blog System Utility Functions

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Calculate reading time in minutes based on word count
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return readingTime
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Extract excerpt from content if not provided
 */
export function extractExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '')
  return truncateText(plainText, maxLength)
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content: string, excerpt?: string): string {
  if (excerpt) return truncateText(excerpt, 160)
  return extractExcerpt(content, 160)
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * Generate unique slug by appending number if needed
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Parse content to extract headings for table of contents
 */
export interface TocItem {
  id: string
  text: string
  level: number
}

export function extractTableOfContents(content: string): TocItem[] {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi
  const toc: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].replace(/<[^>]*>/g, '') // Remove any HTML tags
    const id = generateSlug(text)

    toc.push({ id, text, level })
  }

  return toc
}

/**
 * Format view count with K/M suffix
 */
export function formatViewCount(views: number): string {
  if (views < 1000) return views.toString()
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`
  return `${(views / 1000000).toFixed(1)}M`
}

/**
 * Get status badge color
 */
export function getStatusColor(status: 'draft' | 'published' | 'scheduled'): string {
  switch (status) {
    case 'published':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'draft':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    case 'scheduled':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

/**
 * Sanitize HTML content (basic sanitization)
 */
export function sanitizeHtml(html: string): string {
  // This is a basic sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}

/**
 * Generate SEO-friendly title
 */
export function generateSeoTitle(title: string, siteName: string = 'Nexural Trading'): string {
  return `${title} | ${siteName}`
}

/**
 * Check if post is published and not scheduled for future
 */
export function isPostPublished(post: { status: string; published_at: string | null }): boolean {
  if (post.status !== 'published') return false
  if (!post.published_at) return false
  return new Date(post.published_at) <= new Date()
}

/**
 * Sort posts by date (newest first)
 */
export function sortPostsByDate<T extends { published_at: string | null; created_at: string }>(
  posts: T[]
): T[] {
  return posts.sort((a, b) => {
    const dateA = new Date(a.published_at || a.created_at)
    const dateB = new Date(b.published_at || b.created_at)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Group posts by category
 */
export function groupPostsByCategory<T extends { categories?: Array<{ name: string }> }>(
  posts: T[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {}

  posts.forEach(post => {
    if (post.categories && post.categories.length > 0) {
      post.categories.forEach(category => {
        if (!grouped[category.name]) {
          grouped[category.name] = []
        }
        grouped[category.name].push(post)
      })
    } else {
      if (!grouped['Uncategorized']) {
        grouped['Uncategorized'] = []
      }
      grouped['Uncategorized'].push(post)
    }
  })

  return grouped
}
