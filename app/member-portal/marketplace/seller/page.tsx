'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Seller = {
  id: string
  display_name: string
  bio: string | null
  support_email: string | null
  stripe_connect_account_id: string | null
  stripe_connect_onboarded: boolean
  terms_accepted_at: string | null
  status: string
}

export default function SellerOnboardingPage() {
  const [seller, setSeller] = useState<Seller | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/member/marketplace/seller')
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Failed to load seller profile')
        setSeller(data.seller)
        if (data.seller) {
          setDisplayName(data.seller.display_name || '')
          setBio(data.seller.bio || '')
          setSupportEmail(data.seller.support_email || '')
          setAcceptTerms(!!data.seller.terms_accepted_at)
        }
      } catch (e: any) {
        setError(e?.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function onSave() {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/member/marketplace/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          bio,
          supportEmail,
          acceptTerms,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to save seller profile')
      setSeller(data.seller)
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  async function startStripeConnect() {
    try {
      setConnecting(true)
      setError(null)
      const res = await fetch('/api/member/marketplace/stripe-connect/onboard', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to start Stripe onboarding')
      if (data?.url) window.location.href = data.url
      else throw new Error('Missing onboarding url')
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setConnecting(false)
    }
  }

  async function syncStripeConnect() {
    try {
      setConnecting(true)
      setError(null)
      const res = await fetch('/api/member/marketplace/stripe-connect/sync', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to sync Stripe status')
      // reload seller state
      const res2 = await fetch('/api/member/marketplace/seller')
      const data2 = await res2.json().catch(() => ({}))
      if (res2.ok) setSeller(data2.seller)
      if (data?.onboarded !== true) {
        setError('Stripe onboarding not complete yet. Please finish the Stripe form and try again.')
      }
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Become a Seller</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your seller profile and accept marketplace terms. Stripe payout onboarding is next.
        </p>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-6">
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
          {error ? <div className="mb-4 text-sm text-red-400">{error}</div> : null}

          <label className="block text-sm font-medium">Display name</label>
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <label className="mt-4 block text-sm font-medium">Bio</label>
          <textarea
            className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <label className="mt-4 block text-sm font-medium">Support email</label>
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="support@yourdomain.com"
          />

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            I agree to the Marketplace Terms
          </label>

          <button
            className="mt-6 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            onClick={onSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving…' : seller ? 'Update Seller Profile' : 'Create Seller Profile'}
          </button>

          {seller?.terms_accepted_at ? (
            <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-4 text-sm">
              <div className="font-medium">Next step</div>
              <div className="text-muted-foreground">
                Complete Stripe payout onboarding (Stripe Connect Express).
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 disabled:opacity-50"
                  onClick={startStripeConnect}
                  disabled={connecting}
                >
                  {connecting ? 'Opening…' : 'Start / Continue Stripe Onboarding'}
                </button>
                <button
                  className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 disabled:opacity-50"
                  onClick={syncStripeConnect}
                  disabled={connecting}
                >
                  {connecting ? 'Syncing…' : 'I finished Stripe — verify'}
                </button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Status: {seller.stripe_connect_onboarded ? 'Onboarded ✅' : 'Not onboarded yet'}
              </div>
              <Link className="mt-2 inline-block text-cyan-400 hover:underline" href="/marketplace">
                View Marketplace →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
