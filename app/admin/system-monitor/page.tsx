'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  uptime: number
  lastCheck: string
  services: {
    database: ServiceStatus
    databento: ServiceStatus
    discord: ServiceStatus
    stripe: ServiceStatus
    email: ServiceStatus
    redis: ServiceStatus
  }
}

interface ServiceStatus {
  status: 'online' | 'offline' | 'degraded'
  latency: number
  lastCheck: string
  errorCount: number
  uptime: number
}

interface SystemMetrics {
  requests: {
    total: number
    successful: number
    failed: number
    avgResponseTime: number
  }
  errors: {
    total: number
    last24h: number
    critical: number
    warnings: number
  }
  performance: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
  }
  activity: {
    activeUsers: number
    activeSessions: number
    apiCalls: number
    signalsGenerated: number
  }
}

interface RecentError {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  service: string
  message: string
  stack?: string
}

export default function SystemMonitorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setIsAuthenticated(true)
      loadSystemData()
    } else {
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated && autoRefresh) {
      const interval = setInterval(loadSystemData, 10000) // Update every 10 seconds
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, autoRefresh])

  const loadSystemData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('admin_token')

      // Load system health
      const healthResponse = await fetch('/api/admin/system-monitor?action=health', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (healthResponse.ok) {
        const data = await healthResponse.json()
        setSystemHealth(data.health)
      }

      // Load system metrics
      const metricsResponse = await fetch('/api/admin/system-monitor?action=metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (metricsResponse.ok) {
        const data = await healthResponse.json()
        setSystemMetrics(data.metrics)
      }

      // Load recent errors
      const errorsResponse = await fetch('/api/admin/system-monitor?action=errors&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (errorsResponse.ok) {
        const data = await errorsResponse.json()
        setRecentErrors(data.errors || [])
      }

    } catch (error) {
      console.error('Error loading system data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'critical':
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-400'
      case 'degraded':
        return 'text-yellow-400'
      case 'critical':
      case 'offline':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-white text-lg">Loading system monitor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🔍 System Monitor</h1>
              <p className="text-gray-300">Real-time system health and performance monitoring</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-md ${
                  autoRefresh 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {systemHealth && (
          <>
            {/* Overall System Health */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(systemHealth.overall)} animate-pulse`} />
                  <div>
                    <h2 className="text-2xl font-bold capitalize">{systemHealth.overall}</h2>
                    <p className="text-sm text-gray-400">System Status</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{systemHealth.uptime}%</p>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Last Check</p>
                  <p className="text-sm font-semibold">{new Date(systemHealth.lastCheck).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            {/* Services Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(systemHealth.services).map(([serviceName, service]) => (
                <div
                  key={serviceName}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedService(serviceName)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold capitalize">{serviceName}</h3>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-semibold capitalize ${getStatusText(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Latency:</span>
                      <span className="font-semibold">{service.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Errors:</span>
                      <span className={`font-semibold ${service.errorCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {service.errorCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="font-semibold">{service.uptime}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {systemMetrics && (
          <>
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">📊 Requests</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-semibold">{systemMetrics.requests.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Successful:</span>
                    <span className="font-semibold text-green-400">{systemMetrics.requests.successful.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Failed:</span>
                    <span className="font-semibold text-red-400">{systemMetrics.requests.failed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Response:</span>
                    <span className="font-semibold">{systemMetrics.requests.avgResponseTime}ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-red-400">⚠️ Errors</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-semibold">{systemMetrics.errors.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last 24h:</span>
                    <span className="font-semibold">{systemMetrics.errors.last24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical:</span>
                    <span className="font-semibold text-red-400">{systemMetrics.errors.critical}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Warnings:</span>
                    <span className="font-semibold text-yellow-400">{systemMetrics.errors.warnings}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">⚡ Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">CPU:</span>
                    <span className="font-semibold">{systemMetrics.performance.cpuUsage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory:</span>
                    <span className="font-semibold">{systemMetrics.performance.memoryUsage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Disk:</span>
                    <span className="font-semibold">{systemMetrics.performance.diskUsage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="font-semibold">{systemMetrics.performance.networkLatency}ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-green-400">👥 Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Users:</span>
                    <span className="font-semibold">{systemMetrics.activity.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sessions:</span>
                    <span className="font-semibold">{systemMetrics.activity.activeSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">API Calls:</span>
                    <span className="font-semibold">{systemMetrics.activity.apiCalls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Signals:</span>
                    <span className="font-semibold">{systemMetrics.activity.signalsGenerated}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recent Errors */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-red-400">🚨 Recent Errors</h2>
          {recentErrors.length > 0 ? (
            <div className="space-y-3">
              {recentErrors.map((error) => (
                <div
                  key={error.id}
                  className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        error.level === 'error' ? 'bg-red-600' :
                        error.level === 'warning' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }`}>
                        {error.level.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold">{error.service}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{error.message}</p>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent errors</p>
              <p className="text-xs text-gray-600 mt-2">System is running smoothly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
