'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReportBlockMenu } from '@/components/social/report-block-menu'
import { ContentActions } from '@/components/social/content-actions'

export type FeedActor = {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  is_verified: boolean
} | null

export type FeedPost = {
  id: string
  author_id: string
  content: string | null
  media_urls: string[]
  tags: string[]
  post_type: 'text' | 'image' | 'trade_idea'
  trade_idea: any
  created_at: string
} | null

export function PostCard({ actor, post, createdAt }: { actor: FeedActor; post: FeedPost; createdAt: string }) {
  const name = actor?.display_name || actor?.username || 'Trader'

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/80">
              {(actor?.username || 'TR').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm text-white font-semibold flex items-center gap-2">
                {name}
                {actor?.is_verified ? <Badge variant="secondary" className="bg-white/10 text-white/70">Verified</Badge> : null}
              </div>
              <div className="text-xs text-white/60">{new Date(createdAt).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/20 text-white/70">Post</Badge>
            {post?.id ? (
              <ReportBlockMenu actorUserId={actor?.user_id} targetType="post" targetId={post.id} />
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {post?.content ? <div className="text-sm text-white/90 whitespace-pre-wrap">{post.content}</div> : null}
        {post?.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 6).map((t) => (
              <Badge key={t} variant="secondary" className="bg-white/5 text-white/70">{t}</Badge>
            ))}
          </div>
        ) : null}

        {actor?.username ? (
          <Link href={`/profile/${actor.username}`} className="text-xs text-cyan-300 hover:underline">
            View profile →
          </Link>
        ) : null}

        {post?.id ? (
          <ContentActions targetType="post" targetId={post.id} className="pt-2" />
        ) : null}
      </CardContent>
    </Card>
  )
}
