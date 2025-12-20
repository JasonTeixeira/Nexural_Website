'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Database, Mail, Zap, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    email: ServiceStatus
    sentry: ServiceStatus
  }
  metadata: {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    environment: string
  }
}

interface ServiceStatus {
  status: 'up' | 'down' | 'unknown'
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

export default function HealthDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      setLastCheck(new Date())
    } catch (error) {
      console.error('Failed to fetch health status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'down':
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>
      case 'down':
      case 'unhealthy':
        return <Badge className="bg-red-500">Unhealthy</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const services = [
    {
      name: 'Database',
      key: 'database',
      icon: Database,
      description: 'Supabase PostgreSQL',
    },
    {
      name: 'Redis Cache',
      key: 'redis',
      icon: Zap,
      description: 'Upstash Redis',
    },
    {
      name: 'Email Service',
      key: 'email',
      icon: Mail,
      description: 'Resend API',
    },
    {
      name: 'Error Monitoring',
      key: 'sentry',
      icon: Activity,
      description: 'Sentry',
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system status and service health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {health && getStatusIcon(health.status)}
                System Status
              </CardTitle>
              <CardDescription>
                Last checked: {lastCheck?.toLocaleTimeString() || 'Never'}
              </CardDescription>
            </div>
            {health && getStatusBadge(health.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Environment</p>
              <p className="text-2xl font-semibold capitalize">
                {health?.metadata.environment || '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-semibold">
                {health?.metadata.uptime ? formatUptime(health.metadata.uptime) : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Memory Usage</p>
              <p className="text-2xl font-semibold">
                {health?.metadata.memory ? (
                  <>
                    {health.metadata.memory.used}MB
                    <span className="text-sm text-muted-foreground ml-1">
                      ({health.metadata.memory.percentage}%)
                    </span>
                  </>
                ) : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const status = health?.services[service.key as keyof typeof health.services]
          const Icon = service.icon

          return (
            <Card key={service.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {status && getStatusIcon(status.status)}
                </div>
                <CardTitle className="text-base">{service.name}</CardTitle>
                <CardDescription className="text-xs">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        status?.status === 'up' ? 'default' :
                        status?.status === 'down' ? 'destructive' :
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {status?.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                  
                  {status?.responseTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Response</span>
                      <span className="text-sm font-medium">{status.responseTime}ms</span>
                    </div>
                  )}

                  {status?.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600 dark:text-red-400">
                      {status.error}
                    </div>
                  )}

                  {status?.details?.provider && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Provider</span>
                      <span className="text-sm">{status.details.provider}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Health Check Configuration</CardTitle>
          <CardDescription>
            How to configure and use system health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">API Endpoint</h4>
            <code className="bg-muted px-2 py-1 rounded text-sm">
              GET /api/health
            </code>
            <p className="text-sm text-muted-foreground mt-2">
              Use this endpoint for uptime monitoring services (like UptimeRobot, Pingdom, etc.)
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Status Codes</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 200 - All systems operational (healthy)</li>
              <li>• 207 - Some services degraded</li>
              <li>• 503 - Critical services down (unhealthy)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Required Environment Variables</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• UPSTASH_REDIS_REST_URL - Redis connection</li>
              <li>• UPSTASH_REDIS_REST_TOKEN - Redis auth</li>
              <li>• RESEND_API_KEY - Email service</li>
              <li>• NEXT_PUBLIC_SENTRY_DSN - Error tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
