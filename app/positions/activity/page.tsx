'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ActivityFeed } from '@/components/positions/activity-feed'

export default function ActivityPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Button
          variant="outline"
          onClick={() => router.push('/positions')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Daily Activity Feed</h1>
          <p className="text-muted-foreground text-lg">
            Real-time feed of all trading activity — see exactly what I'm doing, when I'm doing it
          </p>
        </div>

        {/* Activity Feed */}
        <ActivityFeed showFilters={true} />
      </div>
    </div>
  )
}
