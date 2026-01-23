'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Purchase = {
  id: string
  status: string
  granted_at: string
  product: {
    id: string
    slug: string
    title: string
    price_cents: number
    currency: string
  } | null
}

export default function MarketplacePurchasesPage() {
  const [items, setItems] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/member/marketplace/purchases')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to load purchases')
      setItems(data.items || [])
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function download(productId: string) {
    try {
      setDownloading(productId)
      setError(null)
      const res = await fetch('/api/member/marketplace/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to create download link')
      if (data?.url) window.location.href = data.url
      else throw new Error('Missing signed URL')
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Purchases</h1>
          <Link className="text-sm text-cyan-400 hover:underline" href="/marketplace">
            Browse Marketplace →
          </Link>
        </div>

        <p className="mt-2 text-muted-foreground">Your active product entitlements and downloads.</p>
        {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}

        {loading ? <div className="mt-6 text-sm text-muted-foreground">Loading…</div> : null}

        <div className="mt-8 grid gap-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{p.product?.title || 'Unknown product'}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Granted: {new Date(p.granted_at).toLocaleString()}
                  </div>
                  {p.product ? (
                    <div className="mt-2 text-sm">
                      {(p.product.price_cents / 100).toFixed(2)} {p.product.currency}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  {p.product ? (
                    <button
                      className="rounded-md bg-cyan-500 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
                      onClick={() => download(p.product!.id)}
                      disabled={downloading === p.product.id}
                    >
                      {downloading === p.product.id ? 'Preparing…' : 'Download'}
                    </button>
                  ) : null}
                  {p.product?.slug ? (
                    <Link
                      href={`/marketplace/${p.product.slug}`}
                      className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                    >
                      View Product
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
              No purchases yet.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

