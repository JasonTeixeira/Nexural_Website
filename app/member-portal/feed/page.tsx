'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { PostCard } from '@/components/social/post-card'
import { TradeShareCard } from '@/components/social/trade-share-card'

export default function MemberFeedPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [mode, setMode] = useState<'following' | 'portfolio' | 'all'>('following')
  const [cursor, setCursor] = useState<string | null>(null)

  const [composerOpen, setComposerOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [postStatus, setPostStatus] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = mode === 'following' ? '/api/member/ssot-feed' : '/api/member/unified-feed'
      const qs = mode === 'following' ? `?limit=50` : `?mode=${mode}&limit=50`
      const res = await fetch(`${endpoint}${qs}`)
      const j = await res.json().catch(() => ({}))
      if (res.ok) {
        setItems(j.items || [])
        setCursor(j.nextCursor || null)
      } else {
        setItems([])
        setCursor(null)
      }
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    void load()
  }, [load])

  function renderItem(it: any) {
    // SSOT feed items (event-spine derived)
    if (it.type === 'position_event') {
      return (
        <Card key={it.id} className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">
              {it.owner_type === 'admin' ? 'Admin' : 'Trader'} {it.event_type}
            </CardTitle>
            <CardDescription>{new Date(it.occurred_at).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-foreground/90">
            <div className="font-medium">{it.position?.symbol || 'Unknown'}</div>
            <div className="text-xs text-muted-foreground">{it.position?.title || ''}</div>
          </CardContent>
        </Card>
      )
    }

    if (it.activity_type === 'post_created') {
      return <PostCard key={it.id} actor={it.actor || null} post={it.post || null} createdAt={it.created_at} />
    }

    if (it.activity_type === 'position_shared') {
      return <TradeShareCard key={it.id} actor={it.actor || null} share={it.share || null} createdAt={it.created_at} />
    }

    return (
      <Card key={it.id} className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">{it.activity_type}</CardTitle>
          <CardDescription>{new Date(it.created_at).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-foreground/90">
          <pre className="whitespace-pre-wrap break-words text-xs bg-black/30 p-3 rounded border border-border">
            {JSON.stringify(it.metadata || {}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    )
  }

  async function loadMore() {
    if (!cursor) return
    const endpoint = mode === 'following' ? '/api/member/ssot-feed' : '/api/member/unified-feed'
    const qs = mode === 'following'
      ? `?limit=50&cursor=${encodeURIComponent(cursor)}`
      : `?mode=${mode}&limit=50&cursor=${encodeURIComponent(cursor)}`
    const res = await fetch(`${endpoint}${qs}`)
    const j = await res.json().catch(() => ({}))
    if (res.ok) {
      setItems((prev) => [...prev, ...(j.items || [])])
      setCursor(j.nextCursor || null)
    }
  }

  async function submitPost() {
    const content = draft.trim()
    if (!content) return
    setPosting(true)
    setPostStatus(null)
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Failed to post')

      setDraft('')
      setComposerOpen(false)
      setPostStatus('Posted')
      await load()
    } catch (e: any) {
      setPostStatus(e?.message || 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-foreground font-semibold text-2xl">Member Feed</div>
            <div className="text-muted-foreground text-sm">Following + All feed (chronological). Next: notifications + search + portfolio follows.</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={composerOpen ? 'default' : 'outline'}
              className={composerOpen ? '' : 'border-white/20'}
              onClick={() => setComposerOpen((v) => !v)}
              data-testid="feed-create-post"
            >
              {composerOpen ? 'Close' : 'Create post'}
            </Button>
            <Button
              variant={mode === 'following' ? 'default' : 'outline'}
              className={mode === 'following' ? '' : 'border-white/20'}
              onClick={() => setMode('following')}
            >
              Following
            </Button>
            <Button
              variant={mode === 'portfolio' ? 'default' : 'outline'}
              className={mode === 'portfolio' ? '' : 'border-white/20'}
              onClick={() => setMode('portfolio')}
            >
              Portfolios
            </Button>
            <Button
              variant={mode === 'all' ? 'default' : 'outline'}
              className={mode === 'all' ? '' : 'border-white/20'}
              onClick={() => setMode('all')}
            >
              All
            </Button>
            <Link href="/member-portal/community"><Button variant="outline" className="border-white/20">Community</Button></Link>
          </div>
        </div>

        {composerOpen ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Post to the community</CardTitle>
              <CardDescription>Share an idea, a lesson, or a trade thesis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What’s on your mind?"
                className="bg-black/20 border-white/10 min-h-[120px]"
                data-testid="feed-post-textarea"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60">{draft.trim().length}/5000</div>
                <Button onClick={() => void submitPost()} disabled={posting || draft.trim().length === 0} data-testid="feed-post-submit">
                  {posting ? 'Posting…' : 'Post'}
                </Button>
              </div>
              {postStatus ? <div className="text-xs text-white/70">{postStatus}</div> : null}
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <Card className="bg-card border-border"><CardContent className="py-10 text-muted-foreground">Loading…</CardContent></Card>
        ) : items.length === 0 ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>No shared trades yet</CardTitle>
              <CardDescription>Share one of your trades from a position page to start the feed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/positions"><Button>Go to Positions</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((it: any) => renderItem(it))}

            {cursor ? (
              <div className="pt-2">
                <Button variant="outline" onClick={() => void loadMore()}>
                  Load more
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
