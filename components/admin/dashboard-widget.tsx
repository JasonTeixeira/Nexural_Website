'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface DashboardWidgetProps {
  title: string
  description?: string
  icon?: LucideIcon
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  statusText?: string
  value?: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  actions?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }[]
  children?: ReactNode
  className?: string
}

const statusColors = {
  success: 'bg-green-500/10 border-green-500/50 text-green-400',
  warning: 'bg-amber-500/10 border-amber-500/50 text-amber-400',
  error: 'bg-red-500/10 border-red-500/50 text-red-400',
  info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
  neutral: 'bg-gray-500/10 border-gray-500/50 text-gray-400'
}

const statusDotColors = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-500'
}

export function DashboardWidget({
  title,
  description,
  icon: Icon,
  status,
  statusText,
  value,
  change,
  changeType,
  actions,
  children,
  className = ''
}: DashboardWidgetProps) {
  return (
    <Card className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {Icon && (
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-gray-100">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm text-gray-400 mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {status && statusText && (
            <Badge variant="outline" className={statusColors[status]}>
              <div className={`h-2 w-2 rounded-full ${statusDotColors[status]} mr-1.5 ${status === 'success' ? 'animate-pulse' : ''}`} />
              {statusText}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Value Display */}
        {value !== undefined && (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-100">{value}</span>
              {change && (
                <span className={`text-sm font-medium ${
                  changeType === 'positive' ? 'text-green-400' :
                  changeType === 'negative' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {change}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Custom Content */}
        {children && (
          <div className="space-y-3">
            {children}
          </div>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className={
                  action.variant === 'default'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Metric Row Component for displaying key-value pairs
interface MetricRowProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export function MetricRow({ label, value, trend, trendValue }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-100">{value}</span>
        {trend && trendValue && (
          <span className={`text-xs ${
            trend === 'up' ? 'text-green-400' :
            trend === 'down' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}

// Status Indicator Component
interface StatusIndicatorProps {
  label: string
  status: 'online' | 'offline' | 'warning'
}

export function StatusIndicator({ label, status }: StatusIndicatorProps) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    warning: 'bg-amber-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${colors[status]} ${status === 'online' ? 'animate-pulse' : ''}`} />
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  )
}
