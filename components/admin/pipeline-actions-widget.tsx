'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, RefreshCw, Database, Brain } from 'lucide-react'

export function PipelineActionsWidget() {
  const [processing, setProcessing] = useState(false)

  const handleProcess = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/data-pipeline/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await res.json()
      if (data.success) {
        alert('Processing started!')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start processing')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleProcess}
          disabled={processing}
        >
          <Play className="mr-2 h-4 w-4" />
          {processing ? 'Processing...' : 'Process Data'}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => window.location.href = '/api/cron/hourly-feature-generation'}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Features
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => window.location.href = '/admin/data-pipeline'}
        >
          <Database className="mr-2 h-4 w-4" />
          View Pipeline
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => alert('Model training will be implemented')}
        >
          <Brain className="mr-2 h-4 w-4" />
          Train Models
        </Button>
      </CardContent>
    </Card>
  )
}
