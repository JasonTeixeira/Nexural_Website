'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Report = {
  id: string
  product_id: string | null
  reporter_user_id: string | null
  reason: string
  details: string | null
  status: 'open' | 'resolved' | 'dismissed'
  created_at: string
  updated_at: string
}

export default function AdminMarketplaceReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/marketplace/reports', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load reports')
      setReports(json.reports || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(id: string, status: Report['status']) {
    setError(null)
    try {
      const res = await fetch('/api/admin/marketplace/reports', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to update status')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to update status')
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace Reports</h1>
        <p className="text-gray-400">Minimal moderation console for product reports.</p>
      </div>

      {error && (
        <div className="p-3 rounded border border-red-500/40 bg-red-500/10 text-red-200">{error}</div>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reports</CardTitle>
          <Button onClick={load} variant="outline" size="sm">Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : reports.length === 0 ? (
            <div className="text-gray-400">No reports.</div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="p-4 rounded border border-gray-800 bg-gray-950">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
                      <div className="font-semibold">{r.reason}</div>
                      {r.details && <div className="text-sm text-gray-300 whitespace-pre-wrap">{r.details}</div>}
                      <div className="text-xs text-gray-500">
                        report_id={r.id} • product_id={r.product_id || 'n/a'} • reporter={r.reporter_user_id || 'n/a'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select value={r.status} onValueChange={(v: any) => setStatus(r.id, v)}>
                        <SelectTrigger className="w-[160px] bg-gray-900 border-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">open</SelectItem>
                          <SelectItem value="resolved">resolved</SelectItem>
                          <SelectItem value="dismissed">dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

