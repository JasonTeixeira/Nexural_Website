'use client'

import { useEffect, useState } from 'react'

type Props = {
  productId: string
  priceCents: number
}

export function MarketplaceProductActions({ productId, priceCents }: Props) {
  const [loading, setLoading] = useState(false)
  const [entitled, setEntitled] = useState<boolean | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Best-effort: try download endpoint to infer entitlement.
    ;(async () => {
      try {
        const res = await fetch('/api/member/marketplace/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (res.ok) {
          setAuthed(true)
          setEntitled(true)
        } else if (res.status === 401) {
          setAuthed(false)
          setEntitled(null) // not logged in
        } else if (res.status === 403) {
          setAuthed(true)
          setEntitled(false)
        } else {
          setAuthed(true)
          // Other errors: treat as unknown
          setEntitled(false)
        }
      } catch {
        setAuthed(true)
        setEntitled(false)
      }
    })()
  }, [productId])

  async function buy() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/member/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        setError('Please sign in to purchase.')
        return
      }
      if (!res.ok) throw new Error(data?.error || 'Failed to create checkout session')
      if (data?.url) window.location.href = data.url
      else throw new Error('Missing checkout url')
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function download() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/member/marketplace/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        setError('Please sign in to download.')
        return
      }
      if (!res.ok) throw new Error(data?.error || 'Failed to create download link')
      if (data?.url) window.location.href = data.url
      else throw new Error('Missing signed url')
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const isFree = priceCents <= 0

  if (authed === false) {
    return (
      <div className="mt-6">
        <div className="text-sm text-muted-foreground">Sign in to purchase or download.</div>
        <a
          className="mt-3 inline-flex rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black"
          href="/auth"
        >
          Sign in
        </a>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {error ? <div className="mb-3 text-sm text-red-400">{error}</div> : null}

      {entitled === true ? (
        <button
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          onClick={download}
          disabled={loading}
        >
          {loading ? 'Preparing…' : 'Download'}
        </button>
      ) : (
        <button
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          onClick={buy}
          disabled={loading || isFree}
          title={isFree ? 'Free product purchase flow not implemented yet' : undefined}
        >
          {loading ? 'Redirecting…' : 'Buy'}
        </button>
      )}
    </div>
  )
}
