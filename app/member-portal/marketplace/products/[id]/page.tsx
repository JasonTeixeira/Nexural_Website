'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type VersionRow = {
  id: string
  product_id: string
  version: string
  changelog: string | null
  storage_path: string
  created_at: string
}

export default function ProductVersionsPage({ params }: { params: { id: string } }) {
  const productId = params.id
  const [items, setItems] = useState<VersionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [version, setVersion] = useState('')
  const [changelog, setChangelog] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const canSubmit = useMemo(() => Boolean(version.trim() && file), [version, file])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/member/marketplace/products/${productId}/versions`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to load versions')
      setItems(data.items || [])
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  async function createAndUpload() {
    if (!file) return
    try {
      setError(null)

      const res = await fetch(`/api/member/marketplace/products/${productId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          changelog,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to create version')

      const signedUrl = data?.upload?.signedUrl
      const token = data?.upload?.token
      if (!signedUrl || !token) throw new Error('Upload signature missing')

      // Upload file (Supabase signed upload)
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: file,
      })
      if (!uploadRes.ok) {
        const txt = await uploadRes.text().catch(() => '')
        throw new Error(`Upload failed: ${uploadRes.status} ${txt}`)
      }

      setVersion('')
      setChangelog('')
      setFile(null)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Product Versions</h1>
          <Link href="/member-portal/marketplace/products" className="text-sm text-cyan-400 hover:underline">
            ← Back to Products
          </Link>
        </div>

        {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}

        <section className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Upload New Version</h2>
          <div className="mt-4 grid gap-3">
            <label className="text-sm">Version (e.g., 1.0.0)</label>
            <input
              className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />

            <label className="text-sm">Changelog</label>
            <textarea
              className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
              rows={4}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
            />

            <label className="text-sm">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />

            <button
              className="mt-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              onClick={createAndUpload}
              disabled={!canSubmit}
            >
              Create Version + Upload
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">History</h2>
          {loading ? <div className="mt-2 text-sm text-muted-foreground">Loading…</div> : null}
          <div className="mt-4 grid gap-3">
            {items.map((v) => (
              <div key={v.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">{v.version}</div>
                <div className="mt-1 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</div>
                {v.changelog ? <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{v.changelog}</div> : null}
                <div className="mt-2 text-xs text-muted-foreground">storage: {v.storage_path}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

