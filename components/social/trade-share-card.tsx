'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FeedActor } from '@/components/social/post-card'
import { ReportBlockMenu } from '@/components/social/report-block-menu'
import { ContentActions } from '@/components/social/content-actions'

type ShareRow = {
  id: string
  created_at: string
  caption: string | null
  visibility: string
  author_id: string
  position_id: string
  position?: any
} | null

function formatMoney(n: number) {
  const sign = n < 0 ? '-' : ''
  const v = Math.abs(n)
  return `${sign}$${v.toFixed(2)}`
}

export function TradeShareCard({ actor, share, createdAt }: { actor: FeedActor; share: ShareRow; createdAt: string }) {
  const name = actor?.display_name || actor?.username || 'Trader'
  const p = (share as any)?.position || null
  const symbol = p?.symbol || p?.ticker || '—'
  const direction = (p?.direction || '').toString().toUpperCase()
  const pnl = p?.unrealized_pnl
  const pnlPct = p?.unrealized_pnl_pct

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/80">
              {(actor?.username || 'TR').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm text-white font-semibold">{name}</div>
              <div className="text-xs text-white/60">{new Date(createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {direction ? (
              <Badge
                variant="outline"
                className={
                  direction === 'LONG'
                    ? 'border-white/20 text-emerald-300'
                    : direction === 'SHORT'
                      ? 'border-white/20 text-red-300'
                      : 'border-white/20 text-white/70'
                }
              >
                {direction}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="bg-white/5 text-white/70">{symbol}</Badge>
            <Badge variant="outline" className="border-white/20 text-white/70">Trade</Badge>
            {share?.id ? (
              <ReportBlockMenu actorUserId={actor?.user_id} targetType="position_share" targetId={share.id} />
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {share?.caption ? <div className="text-sm text-white/90 whitespace-pre-wrap">{share.caption}</div> : null}

        {typeof pnl === 'number' ? (
          <div className="text-xs text-white/70">
            PnL:{' '}
            <span className={pnl >= 0 ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>
              {formatMoney(pnl)}{typeof pnlPct === 'number' ? ` (${pnlPct.toFixed(2)}%)` : ''}
            </span>
          </div>
        ) : null}

        {share?.position_id ? (
          <Link href={`/positions/${share.position_id}`} className="text-xs text-cyan-300 hover:underline">
            View position →
          </Link>
        ) : null}

        {share?.id ? (
          <ContentActions targetType="trade_share" targetId={share.id} className="pt-2" />
        ) : null}
      </CardContent>
    </Card>
  )
}
