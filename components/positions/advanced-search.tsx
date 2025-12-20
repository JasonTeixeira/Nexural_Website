'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Search, Filter, X, Calendar as CalendarIcon, Save } from 'lucide-react'
import { format } from 'date-fns'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  savedFilters?: SavedFilter[]
  onSaveFilter?: (name: string, filters: SearchFilters) => void
  onLoadFilter?: (filters: SearchFilters) => void
}

export interface SearchFilters {
  // Text search
  searchTerm: string
  searchFields: string[] // ticker, company, thesis, tags
  
  // Basic filters
  sector: string
  setupType: string
  status: string
  conviction: string
  direction: string
  
  // Date filters
  entryDateFrom?: Date
  entryDateTo?: Date
  
  // P&L filters
  pnlMin?: number
  pnlMax?: number
  pnlPctMin?: number
  pnlPctMax?: number
  
  // R-Multiple filters
  rMultipleMin?: number
  rMultipleMax?: number
  
  // Size filters
  positionValueMin?: number
  positionValueMax?: number
  portfolioWeightMin?: number
  portfolioWeightMax?: number
  
  // Days held filters
  daysHeldMin?: number
  daysHeldMax?: number
}

interface SavedFilter {
  name: string
  filters: SearchFilters
}

export function AdvancedSearch({
  onSearch,
  onClear,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    searchFields: ['ticker', 'company', 'thesis'],
    sector: 'all',
    setupType: 'all',
    status: 'all',
    conviction: 'all',
    direction: 'all',
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      searchFields: ['ticker', 'company', 'thesis'],
      sector: 'all',
      setupType: 'all',
      status: 'all',
      conviction: 'all',
      direction: 'all',
    }
    setFilters(clearedFilters)
    onClear()
  }

  const handleSaveFilter = () => {
    if (saveFilterName && onSaveFilter) {
      onSaveFilter(saveFilterName, filters)
      setSaveFilterName('')
      setShowSaveDialog(false)
    }
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchFields') return false
    if (typeof value === 'string') return value !== '' && value !== 'all'
    return value !== undefined && value !== null
  }).length

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Advanced Search & Filters
            </CardTitle>
            <CardDescription>
              {activeFiltersCount > 0 && (
                <span className="text-primary">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleClear}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Search */}
        <div className="space-y-2">
          <Label>Quick Search</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Search ticker, company, thesis, tags..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={filters.direction} onValueChange={(v) => setFilters({ ...filters, direction: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="long">Long Only</SelectItem>
                <SelectItem value="short">Short Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="entered">Entered</SelectItem>
                <SelectItem value="scaling">Scaling</SelectItem>
                <SelectItem value="trimming">Trimming</SelectItem>
                <SelectItem value="watching">Watching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sector</Label>
            <Select value={filters.sector} onValueChange={(v) => setFilters({ ...filters, sector: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Consumer">Consumer</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Setup Type</Label>
            <Select value={filters.setupType} onValueChange={(v) => setFilters({ ...filters, setupType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Setups</SelectItem>
                <SelectItem value="breakout">Breakout</SelectItem>
                <SelectItem value="pullback">Pullback</SelectItem>
                <SelectItem value="momentum">Momentum</SelectItem>
                <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                <SelectItem value="earnings">Earnings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Conviction</Label>
            <Select value={filters.conviction} onValueChange={(v) => setFilters({ ...filters, conviction: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="max">MAX</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-6 border-t border-border">
            {/* Date Range */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Entry Date Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {filters.entryDateFrom ? format(filters.entryDateFrom, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.entryDateFrom}
                        onSelect={(date) => setFilters({ ...filters, entryDateFrom: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {filters.entryDateTo ? format(filters.entryDateTo, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.entryDateTo}
                        onSelect={(date) => setFilters({ ...filters, entryDateTo: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* P&L Filters */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">P&L Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Min P&L ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., -1000"
                    value={filters.pnlMin || ''}
                    onChange={(e) => setFilters({ ...filters, pnlMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max P&L ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={filters.pnlMax || ''}
                    onChange={(e) => setFilters({ ...filters, pnlMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Min P&L (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., -10"
                    value={filters.pnlPctMin || ''}
                    onChange={(e) => setFilters({ ...filters, pnlPctMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max P&L (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={filters.pnlPctMax || ''}
                    onChange={(e) => setFilters({ ...filters, pnlPctMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* R-Multiple Filters */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">R-Multiple Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Min R-Multiple</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., -2"
                    value={filters.rMultipleMin || ''}
                    onChange={(e) => setFilters({ ...filters, rMultipleMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max R-Multiple</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5"
                    value={filters.rMultipleMax || ''}
                    onChange={(e) => setFilters({ ...filters, rMultipleMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Position Size Filters */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Position Size</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Min Value ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000"
                    value={filters.positionValueMin || ''}
                    onChange={(e) => setFilters({ ...filters, positionValueMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max Value ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={filters.positionValueMax || ''}
                    onChange={(e) => setFilters({ ...filters, positionValueMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Min Portfolio % Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1"
                    value={filters.portfolioWeightMin || ''}
                    onChange={(e) => setFilters({ ...filters, portfolioWeightMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max Portfolio % Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 20"
                    value={filters.portfolioWeightMax || ''}
                    onChange={(e) => setFilters({ ...filters, portfolioWeightMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Days Held */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Days Held</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Min Days</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    value={filters.daysHeldMin || ''}
                    onChange={(e) => setFilters({ ...filters, daysHeldMin: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max Days</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 365"
                    value={filters.daysHeldMax || ''}
                    onChange={(e) => setFilters({ ...filters, daysHeldMax: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button onClick={handleSearch} className="flex-1 sm:flex-none">
            <Search className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
          {onSaveFilter && (
            <Button variant="outline" onClick={() => setShowSaveDialog(!showSaveDialog)}>
              <Save className="w-4 h-4 mr-2" />
              Save Filter
            </Button>
          )}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={handleClear}>
              Clear All
            </Button>
          )}
        </div>

        {/* Save Filter Dialog */}
        {showSaveDialog && (
          <div className="p-4 border border-border rounded-lg bg-card/50">
            <Label className="mb-2">Filter Name</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., High Conviction Winners"
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
              />
              <Button onClick={handleSaveFilter}>Save</Button>
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && onLoadFilter && (
          <div className="space-y-2">
            <Label>Saved Filters</Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((saved, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(saved.filters)
                    onLoadFilter(saved.filters)
                  }}
                >
                  {saved.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
