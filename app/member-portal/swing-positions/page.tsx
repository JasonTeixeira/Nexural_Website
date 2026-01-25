'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

/**
 * Compatibility page
 *
 * SSOT stance: legacy `swing_positions` is deprecated.
 * The canonical trading ledger is positions + position_events.
 */
export default function SwingPositionsCompatibilityPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/member-portal/portfolio')
    }, 3500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <MemberPortalLayoutNew>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-2xl">Swing positions moved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>SSOT upgrade</AlertTitle>
              <AlertDescription>
                Swing positions are now represented by your canonical portfolio positions.
                You’ll be redirected to your Portfolio in a moment.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/member-portal/portfolio">Go to Portfolio</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/member-portal/feed">Go to Feed</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              This page is temporary and will be removed after the deletion-gate window.
            </p>
          </CardContent>
        </Card>
      </div>
    </MemberPortalLayoutNew>
  )
}
