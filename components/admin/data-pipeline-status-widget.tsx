'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export function DataPipelineStatusWidget() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/data-pipeline/status')
      const data = await res.json()
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
      case 'inactive':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Pipeline</CardTitle>
        {getStatusIcon(status?.overall)}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Data Collection</span>
            {getStatusIcon(status?.dataCollection?.status)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Processing</span>
            {getStatusIcon(status?.processing?.status)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Features</span>
            {getStatusIcon(status?.featureGeneration?.status)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Training</span>
            {getStatusIcon(status?.modelTraining?.status)}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.location.href = '/admin/data-pipeline'}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
