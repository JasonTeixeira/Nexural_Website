'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  slug: string
  type: string
  title: string
  description: string
  price_cents: number
  currency: string
  status: string
}

export default function SellerProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    type: 'indicator',
    title: '',
    description: '',
    price_cents: 0,
    currency: 'USD',
  })

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/member/marketplace/products')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to load products')
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

  async function createProduct() {
    try {
      setError(null)
      const res = await fetch('/api/member/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to create product')
      setForm({ type: 'indicator', title: '', description: '', price_cents: 0, currency: 'USD' })
      await load()
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Marketplace Products</h1>
          <Link href="/member-portal/marketplace/seller" className="text-sm text-cyan-400 hover:underline">
            Seller Settings →
          </Link>
        </div>

        <p className="mt-2 text-muted-foreground">Create products and upload versions for buyers to download.</p>

        {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}

        <section className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Create Product</h2>
          <div className="mt-4 grid gap-3">
            <label className="text-sm">Type</label>
            <select
              className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="indicator">indicator</option>
              <option value="code">code</option>
              <option value="system">system</option>
              <option value="other">other</option>
            </select>

            <label className="text-sm">Title</label>
            <input
              className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />

            <label className="text-sm">Description</label>
            <textarea
              className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Price (cents)</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  value={form.price_cents}
                  onChange={(e) => setForm((f) => ({ ...f, price_cents: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm">Currency</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                />
              </div>
            </div>

            <button
              className="mt-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black"
              onClick={createProduct}
            >
              Create
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Products</h2>
          {loading ? <div className="mt-2 text-sm text-muted-foreground">Loading…</div> : null}
          <div className="mt-4 grid gap-3">
            {items.map((p) => (
              <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">{p.type}</div>
                    <div className="text-lg font-semibold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">slug: {p.slug}</div>
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</div>
                    <div className="mt-3 text-sm">
                      {(p.price_cents / 100).toFixed(2)} {p.currency} • {p.status}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/member-portal/marketplace/products/${p.id}`}
                      className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                    >
                      Manage Versions
                    </Link>
                    <Link
                      href={`/marketplace/${p.slug}`}
                      className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                    >
                      View Public
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

