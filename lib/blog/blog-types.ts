// Blog System TypeScript Types

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author_id: string | null
  status: 'draft' | 'published' | 'scheduled'
  published_at: string | null
  views: number
  reading_time: number | null
  is_featured: boolean
  allow_comments: boolean
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  created_at: string
  updated_at: string
  categories?: BlogCategory[]
  tags?: BlogTag[]
  author?: {
    id: string
    email: string
    full_name?: string
  }
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  post_count: number
  created_at: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  usage_count: number
  created_at: string
}

export interface BlogPostCategory {
  post_id: string
  category_id: string
}

export interface BlogPostTag {
  post_id: string
  tag_id: string
}

export interface CreatePostData {
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image?: string
  status?: 'draft' | 'published' | 'scheduled'
  published_at?: string
  is_featured?: boolean
  allow_comments?: boolean
  meta_title?: string
  meta_description?: string
  og_image?: string
  category_ids?: string[]
  tag_ids?: string[]
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
}

export interface BlogFilters {
  status?: 'draft' | 'published' | 'scheduled'
  category?: string
  tag?: string
  search?: string
  author_id?: string
  is_featured?: boolean
  limit?: number
  offset?: number
}

export interface BlogStats {
  total_posts: number
  total_views: number
  total_categories: number
  total_tags: number
  published_posts: number
  draft_posts: number
}
