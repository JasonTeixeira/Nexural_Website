'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PerformanceAnalytics } from '@/components/positions/performance-analytics'
import { TradingCalendar } from '@/components/positions/trading-calendar'
import { EnhancedAnalytics } from '@/components/positions/enhanced-analytics'

export default function AnalyticsPage() {
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
          Back to Positions
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Performance Analytics</h1>
          <p className="text-muted-foreground text-lg">
            Deep dive into trading performance — win rates, R-multiples, setup analysis, and more
          </p>
        </div>

        {/* Trading Calendar */}
        <div className="mb-8">
          <TradingCalendar />
        </div>

        {/* Enhanced Analytics */}
        <div className="mb-8">
          <EnhancedAnalytics />
        </div>

        {/* Performance Analytics */}
        <PerformanceAnalytics />
      </div>
    </div>
  )
}
