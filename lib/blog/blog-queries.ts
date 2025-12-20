// Blog System Supabase Query Functions

import { createClient } from '@supabase/supabase-js'
import type { BlogPost, BlogCategory, BlogTag, BlogFilters, CreatePostData, UpdatePostData } from './blog-types'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// BLOG POSTS QUERIES
// ============================================

/**
 * Get all published posts with filters
 */
export async function getPublishedPosts(filters?: BlogFilters) {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      categories:blog_post_categories(
        category:blog_categories(*)
      ),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (filters?.category) {
    query = query.contains('categories', [{ slug: filters.category }])
  }

  if (filters?.tag) {
    query = query.contains('tags', [{ slug: filters.tag }])
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BlogPost[]
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      categories:blog_post_categories(
        category:blog_categories(*)
      ),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as BlogPost
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(limit: number = 3) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as BlogPost[]
}

/**
 * Get related posts by category
 */
export async function getRelatedPosts(postId: string, categoryIds: string[], limit: number = 3) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .neq('id', postId)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as BlogPost[]
}

/**
 * Increment post view count
 */
export async function incrementPostViews(postId: string) {
  const { error } = await supabase.rpc('increment_post_views', { post_id: postId })
  if (error) console.error('Error incrementing views:', error)
}

/**
 * Get all posts (admin)
 */
export async function getAllPosts(filters?: BlogFilters) {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      categories:blog_post_categories(
        category:blog_categories(*)
      ),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BlogPost[]
}

/**
 * Create a new post
 */
export async function createPost(postData: CreatePostData) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([postData])
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

/**
 * Update a post
 */
export async function updatePost(postData: UpdatePostData) {
  const { id, ...updates } = postData
  
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

// ============================================
// CATEGORIES QUERIES
// ============================================

/**
 * Get all categories
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data as BlogCategory[]
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as BlogCategory
}

/**
 * Create category
 */
export async function createCategory(category: Omit<BlogCategory, 'id' | 'created_at' | 'post_count'>) {
  const { data, error } = await supabase
    .from('blog_categories')
    .insert([category])
    .select()
    .single()

  if (error) throw error
  return data as BlogCategory
}

/**
 * Update category
 */
export async function updateCategory(id: string, updates: Partial<BlogCategory>) {
  const { data, error } = await supabase
    .from('blog_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BlogCategory
}

/**
 * Delete category
 */
export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('blog_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// TAGS QUERIES
// ============================================

/**
 * Get all tags
 */
export async function getTags() {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name')

  if (error) throw error
  return data as BlogTag[]
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as BlogTag
}

/**
 * Create tag
 */
export async function createTag(tag: Omit<BlogTag, 'id' | 'created_at' | 'usage_count'>) {
  const { data, error } = await supabase
    .from('blog_tags')
    .insert([tag])
    .select()
    .single()

  if (error) throw error
  return data as BlogTag
}

/**
 * Update tag
 */
export async function updateTag(id: string, updates: Partial<BlogTag>) {
  const { data, error } = await supabase
    .from('blog_tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BlogTag
}

/**
 * Delete tag
 */
export async function deleteTag(id: string) {
  const { error } = await supabase
    .from('blog_tags')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get blog statistics
 */
export async function getBlogStats() {
  const [postsCount, viewsSum, categoriesCount, tagsCount] = await Promise.all([
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('views'),
    supabase.from('blog_categories').select('*', { count: 'exact', head: true }),
    supabase.from('blog_tags').select('*', { count: 'exact', head: true })
  ])

  const totalViews = viewsSum.data?.reduce((sum: number, post: any) => sum + (post.views || 0), 0) || 0

  return {
    total_posts: postsCount.count || 0,
    total_views: totalViews,
    total_categories: categoriesCount.count || 0,
    total_tags: tagsCount.count || 0,
    published_posts: 0, // Calculate separately if needed
    draft_posts: 0 // Calculate separately if needed
  }
}
