'use client'

import { useEffect, useMemo, useState } from 'react'
import { Heart, MessageCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

type TargetType = 'post' | 'trade_share' | 'portfolio'

type CommentRow = {
  id: string
  user_id: string
  target_type: TargetType
  target_id: string
  parent_id: string | null
  content: string
  is_deleted: boolean
  created_at: string
  actor?: any
}

export function ContentActions(props: {
  targetType: TargetType
  targetId: string
  className?: string
}) {
  const { targetType, targetId, className } = props
  const [liking, setLiking] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState<number>(0)
  const [showComments, setShowComments] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  async function toggleLike() {
    setLiking(true)
    try {
      const res = await fetch('/api/social/content/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, action: liked ? 'unlike' : 'like' }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Failed')
      setLiked(!!j.liked)
      if (typeof j.count === 'number') setLikeCount(j.count)
    } catch (e) {
      console.warn('like failed', e)
    } finally {
      setLiking(false)
    }
  }

  async function hydrateLike() {
    try {
      const res = await fetch(`/api/social/content/like?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`)
      const j = await res.json().catch(() => ({}))
      if (!res.ok) return
      if (typeof j.liked === 'boolean') setLiked(j.liked)
      if (typeof j.count === 'number') setLikeCount(j.count)
    } catch (e) {
      // ignore
    }
  }

  async function loadComments() {
    setLoadingComments(true)
    try {
      const res = await fetch(`/api/social/content/comments?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}&limit=50`)
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Failed to load comments')
      setComments(j.items || [])
    } catch (e) {
      console.warn('load comments failed', e)
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    if (showComments) void loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments])

  useEffect(() => {
    void hydrateLike()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId])

  async function postComment() {
    const content = draft.trim()
    if (!content) return
    setPosting(true)
    try {
      const res = await fetch('/api/social/content/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, content }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Failed to comment')
      setDraft('')
      await loadComments()
    } catch (e) {
      console.warn('comment failed', e)
    } finally {
      setPosting(false)
    }
  }

  const visibleComments = useMemo(() => comments.filter((c) => !c.is_deleted), [comments])

  return (
    <div className={className || ''}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/15"
          onClick={() => void toggleLike()}
          disabled={liking}
          data-testid={`content-like:${targetType}:${targetId}`}
        >
          <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
          {liked ? 'Liked' : 'Like'}
          {likeCount ? (
            <Badge variant="secondary" className="ml-2 bg-white/10 text-white/80">{likeCount}</Badge>
          ) : null}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/15"
          onClick={() => setShowComments((v) => !v)}
          data-testid={`content-comments-toggle:${targetType}:${targetId}`}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Comments
          {visibleComments.length ? (
            <Badge variant="secondary" className="ml-2 bg-white/10 text-white/80">{visibleComments.length}</Badge>
          ) : null}
        </Button>
      </div>

      {showComments ? (
        <div className="mt-3 space-y-2">
          {loadingComments ? (
            <div className="text-xs text-white/60">Loading comments…</div>
          ) : visibleComments.length === 0 ? (
            <div className="text-xs text-white/60">No comments yet.</div>
          ) : (
            <div className="space-y-2">
              {visibleComments.map((c) => (
                <div key={c.id} className="rounded border border-white/10 bg-black/20 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {c.actor?.avatar_url ? (
                          <Image src={c.actor.avatar_url} alt={c.actor.username || 'User'} width={28} height={28} className="h-7 w-7 object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-white/60" />
                        )}
                      </div>
                      {c.actor?.username ? (
                        <Link href={`/profile/${c.actor.username}`} className="text-xs text-cyan-300 hover:underline truncate">
                          {c.actor.display_name || c.actor.username}
                        </Link>
                      ) : (
                        <div className="text-xs text-white/70 truncate">Trader</div>
                      )}
                    </div>
                    <div className="text-[10px] text-white/50">{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-white/90 whitespace-pre-wrap">{c.content}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment…"
              className="bg-black/20 border-white/10"
              data-testid={`content-comment-input:${targetType}:${targetId}`}
            />
            <Button size="sm" onClick={() => void postComment()} disabled={posting || draft.trim().length === 0} data-testid={`content-comment-submit:${targetType}:${targetId}`}>
              {posting ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
