'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function UnsubscribePage() {
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [subscriberId, setSubscriberId] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const e = params?.get('email')
    const sid = params?.get('subscriberId')
    if (e) setEmail(e)
    if (sid) setSubscriberId(sid)
  }, [params])

  async function unsubscribe() {
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId: subscriberId || undefined, email: email || undefined }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to unsubscribe')
      }

      setStatus('done')
    } catch (e: any) {
      setStatus('error')
      setError(e?.message || 'Failed to unsubscribe')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unsubscribe</CardTitle>
          <CardDescription>
            Enter your email to unsubscribe from Nexural Trading newsletter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'done' ? (
            <div className="p-3 rounded bg-green-500/10 border border-green-500/40 text-green-500 text-sm">
              You’re unsubscribed. Sorry to see you go.
            </div>
          ) : null}
          {status === 'error' ? (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/40 text-red-500 text-sm">
              {error}
            </div>
          ) : null}

          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'done'}
          />
          <Button
            className="w-full"
            onClick={unsubscribe}
            disabled={!email || status === 'loading' || status === 'done'}
          >
            {status === 'loading' ? 'Unsubscribing…' : 'Unsubscribe'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
