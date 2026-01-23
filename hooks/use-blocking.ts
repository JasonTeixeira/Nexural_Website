'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export type BlockRow = {
  blocked_id: string
  is_muted: boolean
  created_at: string
}

export function useBlocking() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<BlockRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const blockedIds = useMemo(() => new Set(items.map((i) => i.blocked_id)), [items])
  const mutedIds = useMemo(() => new Set(items.filter((i) => i.is_muted).map((i) => i.blocked_id)), [items])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/member/block', { method: 'GET' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Failed to load blocks')
      setItems(j.items || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load blocks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const action = useCallback(async (targetUserId: string, action: 'block' | 'unblock' | 'mute' | 'unmute') => {
    const res = await fetch('/api/member/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, action }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(j.error || 'Failed')
    await refresh()
    return j
  }, [refresh])

  return {
    loading,
    items,
    blockedIds,
    mutedIds,
    error,
    refresh,
    action,
    isBlocked: (userId?: string | null) => !!(userId && blockedIds.has(userId)),
    isMuted: (userId?: string | null) => !!(userId && mutedIds.has(userId)),
  }
}

