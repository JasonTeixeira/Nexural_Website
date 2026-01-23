'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

type OnboardingStatus = {
  ok: boolean
  required: {
    follow_admin: boolean
    enable_admin_alerts?: boolean
  }
  state: {
    follows_admin: boolean
    admin_alerts_enabled: boolean
  }
  reason?: string
}

export default function MemberOnboardingGatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/member/onboarding/status', { cache: 'no-store' })
      if (res.status === 401) {
        router.push('/auth/login')
        return
      }
      const json = (await res.json()) as OnboardingStatus
      setStatus(json)
    } catch (e: any) {
      setError(e?.message || 'Failed to load onboarding status')
    } finally {
      setLoading(false)
    }
  }

  async function attemptComplete() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/member/onboarding/complete', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Failed to complete onboarding')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to complete onboarding')
    } finally {
      await load()
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status?.ok) router.push('/member-portal')
  }, [status, router])

  return (
    <MemberPortalLayoutNew>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Finish setup</h1>
          <p className="text-gray-400 mt-2">
            SSOT onboarding requires you to follow the Admin account and enable admin trade alerts.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Onboarding status error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking your account…
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Follow Admin</div>
                    <div className="text-sm text-gray-400">Required to see the feed and receive alerts.</div>
                  </div>
                  {status?.state?.follows_admin ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      Done
                    </div>
                  ) : (
                    <div className="text-yellow-400">Pending</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable admin trade alerts</div>
                    <div className="text-sm text-gray-400">SSOT onboarding success includes at least one admin alert.</div>
                  </div>
                  {status?.state?.admin_alerts_enabled ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      Done
                    </div>
                  ) : (
                    <div className="text-yellow-400">Pending</div>
                  )}
                </div>

                {status?.reason && (
                  <Alert>
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>{status.reason}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={load} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-check
                  </Button>
                  <Button onClick={attemptComplete}>
                    Complete setup
                  </Button>
                  <Link href="/member-portal/settings" className="flex-1">
                    <Button className="w-full">Go to settings</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberPortalLayoutNew>
  )
}
