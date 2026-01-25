'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Admin compatibility page
 *
 * SSOT stance: Admin trade publishing happens via canonical positions + events
 * (see /admin/positions). We are deprecating the separate “signals” system.
 */
export default function AdminSignalsCompatibilityPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/admin/positions')
    }, 2500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Signals moved</h1>
        <p className="text-gray-300">
          We’re consolidating admin publishing into the SSOT ledger. Use <b>Admin Positions</b> for all trade entries.
          You’ll be redirected shortly.
        </p>
        <div className="flex gap-3">
          <Link
            href="/admin/positions"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
          >
            Go to Admin Positions
          </Link>
          <Link
            href="/admin"
            className="flex-1 text-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
          >
            Back to Admin Dashboard
          </Link>
        </div>
        <p className="text-xs text-gray-400">This page is temporary and will be removed after the deletion-gate window.</p>
      </div>
    </div>
  )
}
