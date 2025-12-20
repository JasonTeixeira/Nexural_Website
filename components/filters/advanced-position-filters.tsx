'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from '@/components/ui/slider'
import { X, Filter, Calendar, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface AdvancedFilters {
  dateRangeType: 'all' | 'last7' | 'last30' | 'last90' | 'custom'
  startDate: string
  endDate: string
  pnlMin: number
  pnlMax: number
  pnlRangeEnabled: boolean
}

interface AdvancedPositionFiltersProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  onClear: () => void
  positionCount: number
  totalCount: number
}

export function AdvancedPositionFilters({
  filters,
  onFiltersChange,
  onClear,
  positionCount,
  totalCount
}: AdvancedPositionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = 
    filters.dateRangeType !== 'all' || 
    filters.pnlRangeEnabled

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleDateRangeChange = (type: string) => {
    const now = new Date()
    let startDate = ''
    let endDate = now.toISOString().split('T')[0]

    switch (type) {
      case 'last7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last90':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'custom':
        // Keep existing dates or set defaults
        startDate = filters.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        endDate = filters.endDate || now.toISOString().split('T')[0]
        break
      case 'all':
      default:
        startDate = ''
        endDate = ''
        break
    }

    onFiltersChange({
      ...filters,
      dateRangeType: type as any,
      startDate,
      endDate
    })
  }

  return (
    <div className="space-y-3">
      {/* Filter Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isExpanded ? "default" : "outline"}
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={hasActiveFilters ? "border-cyan-500" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 bg-cyan-500/20 text-cyan-400">
                Active
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Advanced
            </Button>
          )}
        </div>

        <span className="text-sm text-gray-400">
          {positionCount} of {totalCount} positions
        </span>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-cyan-500" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-cyan-400" />
                Date Range
              </Label>
              
              <Select 
                value={filters.dateRangeType} 
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {filters.dateRangeType === 'custom' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label className="text-xs text-gray-400">Start Date</Label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => updateFilter('startDate', e.target.value)}
                      className="bg-gray-800 border-gray-700 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">End Date</Label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => updateFilter('endDate', e.target.value)}
                      className="bg-gray-800 border-gray-700 mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* P&L Range Filter */}
            <div className="space-y-3 pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  P&L Range
                </Label>
                <Button
                  variant={filters.pnlRangeEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('pnlRangeEnabled', !filters.pnlRangeEnabled)}
                  className="h-7 text-xs"
                >
                  {filters.pnlRangeEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {filters.pnlRangeEnabled && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-400">Min P&L ($)</Label>
                      <Input
                        type="number"
                        value={filters.pnlMin}
                        onChange={(e) => updateFilter('pnlMin', Number(e.target.value))}
                        placeholder="-1000"
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Max P&L ($)</Label>
                      <Input
                        type="number"
                        value={filters.pnlMax}
                        onChange={(e) => updateFilter('pnlMax', Number(e.target.value))}
                        placeholder="1000"
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>${filters.pnlMin.toFixed(0)}</span>
                    <span className="text-cyan-400">P&L Filter Range</span>
                    <span>${filters.pnlMax.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Preset Filters */}
            <div className="space-y-2 pt-2 border-t border-gray-700">
              <Label className="text-xs text-gray-400 font-semibold">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onFiltersChange({
                      ...filters,
                      pnlRangeEnabled: true,
                      pnlMin: 0,
                      pnlMax: 999999
                    })
                  }}
                  className="text-xs"
                >
                  Winners Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onFiltersChange({
                      ...filters,
                      pnlRangeEnabled: true,
                      pnlMin: -999999,
                      pnlMax: 0
                    })
                  }}
                  className="text-xs"
                >
                  Losers Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeChange('last30')}
                  className="text-xs"
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeChange('last7')}
                  className="text-xs"
                >
                  This Week
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Default filters export
export const defaultAdvancedFilters: AdvancedFilters = {
  dateRangeType: 'all',
  startDate: '',
  endDate: '',
  pnlMin: -999999,
  pnlMax: 999999,
  pnlRangeEnabled: false
}

// Helper function to apply advanced filters to positions
export function applyAdvancedFilters<T extends {
  entry_date: string
  exit_date: string | null
  pnl: number | null
}>(positions: T[], filters: AdvancedFilters): T[] {
  return positions.filter(position => {
    // Date range filter
    if (filters.dateRangeType !== 'all') {
      const entryDate = new Date(position.entry_date)
      const exitDate = position.exit_date ? new Date(position.exit_date) : null
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate)
        // Check if trade was active during the range
        const tradeStartsInRange = entryDate >= startDate
        const tradeEndsInRange = exitDate ? exitDate >= startDate : true
        
        if (!tradeStartsInRange && !tradeEndsInRange) {
          return false
        }
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // Include the entire end date
        
        const tradeStartsBeforeEnd = entryDate <= endDate
        const tradeEndsBeforeEnd = exitDate ? exitDate <= endDate : true
        
        if (!tradeStartsBeforeEnd && !tradeEndsBeforeEnd) {
          return false
        }
      }
    }

    // P&L range filter
    if (filters.pnlRangeEnabled && position.pnl !== null) {
      if (position.pnl < filters.pnlMin || position.pnl > filters.pnlMax) {
        return false
      }
    }

    return true
  })
}
