'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function DataQualityWidget() {
  const [quality, setQuality] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuality = async () => {
      try {
        const res = await fetch('/api/admin/data-pipeline/quality')
        const data = await res.json()
        if (data.success) {
          setQuality(data.data)
        }
      } catch (error) {
        console.error('Error fetching quality:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuality()
    const interval = setInterval(fetchQuality, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  const score = quality?.score || 0
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <p className="text-sm text-muted-foreground mt-1">Quality Score</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completeness</span>
            <span>{quality?.completeness?.toFixed(1)}%</span>
          </div>
          <Progress value={quality?.completeness || 0} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{quality?.gaps?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Gaps</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{quality?.anomalies?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
