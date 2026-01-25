/*
 * SSOT Positions Widget
 *
 * This replaces the legacy SwingPositionsWidget (which queried `swing_positions`).
 * SSOT stance: Admin/member “signals/positions” must be represented by the canonical
 * ledger + event spine.
 *
 * For Phase-1 parity we show recent SSOT feed items (position events) and link to
 * the member feed for the full experience.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

type FeedItem = {
  id: string
  type: 'position_event'
  event_type: string
  occurred_at: string
  owner_type: 'admin' | 'member' | 'unknown'
  position: null | {
    id: string
    symbol: string
    direction?: string | null
    status?: string | null
    title?: string | null
    opened_at?: string | null
  }
}

export function SSOTPositionsWidget() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/member/ssot-feed?limit=5', { cache: 'no-store' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || `Failed to load feed (${res.status})`)
        }
        const json = await res.json()
        if (!mounted) return
        setItems((json?.items || []) as FeedItem[])
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load feed')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Latest SSOT activity</CardTitle>
            <CardDescription>
              Your feed is derived from the canonical event spine (no legacy swing_positions/signals).
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/member-portal/feed">
              Open feed <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Activity className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent events yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => {
              const symbol = it.position?.symbol || '—'
              const direction = (it.position?.direction || '').toLowerCase()
              const isLong = direction.includes('long') || direction.includes('buy')
              const icon = isLong ? <TrendingUp className="h-4 w-4 text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />
              const label = it.event_type.replace('position.', '').replace('_', ' ')
              return (
                <div key={it.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">{icon}</div>
                    <div>
                      <div className="font-semibold">{symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(it.occurred_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {it.owner_type}
                    </Badge>
                    <Badge className="capitalize">{label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
