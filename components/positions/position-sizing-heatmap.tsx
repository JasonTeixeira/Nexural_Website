'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Position {
  ticker: string
  company_name: string
  position_value: number
  portfolio_percentage: number
  sector: string
  entry_date: string
  shares: number
  entry_price: number
}

interface PositionSizingHeatmapProps {
  positions: Position[]
}

export function PositionSizingHeatmap({ positions }: PositionSizingHeatmapProps) {
  // Calculate total portfolio value
  const totalPortfolioValue = positions.reduce((sum, p) => sum + p.position_value, 0)

  // Transform positions data for treemap - sized by portfolio percentage
  const treemapData = positions.map((position) => {
    const percentage = totalPortfolioValue > 0 
      ? (position.position_value / totalPortfolioValue) * 100 
      : 0

    return {
      name: position.ticker,
      size: percentage, // Use percentage for sizing
      value: position.position_value,
      percentage,
      sector: position.sector,
      companyName: position.company_name,
      shares: position.shares,
      entryPrice: position.entry_price,
      entryDate: position.entry_date,
    }
  })

  // Get color based on sector
  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      'Technology': '#3b82f6',      // Blue
      'Healthcare': '#10b981',      // Green
      'Finance': '#f59e0b',         // Orange
      'Consumer': '#8b5cf6',        // Purple
      'Energy': '#ef4444',          // Red
      'Industrials': '#6366f1',     // Indigo
      'Materials': '#14b8a6',       // Teal
      'Utilities': '#84cc16',       // Lime
      'Real Estate': '#ec4899',     // Pink
      'Telecommunications': '#06b6d4', // Cyan
    }
    return colors[sector] || '#64748b' // Default gray
  }

  // Get size category badge
  const getSizeCategory = (percentage: number) => {
    if (percentage >= 15) return { label: 'Very Large', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    if (percentage >= 10) return { label: 'Large', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
    if (percentage >= 5) return { label: 'Medium', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    return { label: 'Small', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
  }

  // Custom content for each cell
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, percentage, sector, companyName } = props

    // Don't render if too small
    if (width < 60 || height < 40) return null

    const fontSize = width < 100 ? '11px' : '13px'
    const showCompany = width > 140 && height > 60
    const showSector = width > 100 && height > 50

    return (
      <g className="tile-group">
        {/* Gradients and filters */}
        <defs>
          <linearGradient id={`sector-gradient-${name}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: getSectorColor(sector), stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: getSectorColor(sector), stopOpacity: 0.8 }} />
          </linearGradient>
          <filter id={`sector-shadow-${name}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Base rectangle with rounded corners */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx="6"
          ry="6"
          style={{
            fill: `url(#sector-gradient-${name})`,
            stroke: 'rgba(255, 255, 255, 0.15)',
            strokeWidth: 1.5,
            filter: `url(#sector-shadow-${name})`,
          }}
        />
        
        {/* Subtle shine overlay */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height * 0.4}
          rx="6"
          ry="6"
          style={{
            fill: 'rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }}
        />
        {/* Text with enhanced styling */}
        {name && (
          <text
            x={x + width / 2}
            y={y + height / 2 - (showCompany ? 10 : 0)}
            textAnchor="middle"
            fill="white"
            fontSize={width > 80 ? '15px' : '13px'}
            fontWeight="700"
            style={{ 
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              letterSpacing: '0.5px'
            }}
          >
            {name}
          </text>
        )}
        
        {/* Company name */}
        {showCompany && companyName && typeof companyName === 'string' && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 3}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.85)"
            fontSize="10px"
            fontWeight="500"
          >
            {companyName.length > 18 ? companyName.substring(0, 18) + '...' : companyName}
          </text>
        )}
        
        {/* Percentage */}
        {percentage !== undefined && percentage !== null && (
          <text
            x={x + width / 2}
            y={y + height / 2 + (showCompany ? 18 : showSector ? 12 : 8)}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={width > 80 ? '14px' : '12px'}
            fontWeight="700"
            style={{ 
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              letterSpacing: '0.3px'
            }}
          >
            {percentage.toFixed(1)}%
          </text>
        )}
        
        {/* Sector */}
        {showSector && (
          <text
            x={x + width / 2}
            y={y + height / 2 + (showCompany ? 32 : 25)}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize="9px"
            fontWeight="500"
          >
            {sector}
          </text>
        )}
      </g>
    )
  }

  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const category = getSizeCategory(data.percentage)
      
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getSectorColor(data.sector) }}
              />
              <p className="font-bold text-white text-base">{data.name}</p>
            </div>
            <Badge className={category.color}>{category.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3 pl-5">{data.companyName}</p>
          
          <div className="space-y-2 text-sm pl-5">
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Portfolio %:</span>
              <span className="text-white font-bold text-lg">
                {data.percentage.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Position Value:</span>
              <span className="text-white font-bold">
                ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Shares:</span>
              <span className="text-white font-medium">{data.shares}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Entry Price:</span>
              <span className="text-white font-medium">${data.entryPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Sector:</span>
              <span className="text-white font-medium">{data.sector}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Entry Date:</span>
              <span className="text-white font-medium">
                {new Date(data.entryDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate concentration risk
  const concentrationRisk = () => {
    const largePositions = treemapData.filter(p => p.percentage >= 10).length
    const veryLargePositions = treemapData.filter(p => p.percentage >= 15).length
    
    if (veryLargePositions > 0) return { level: 'High', color: 'text-red-400', icon: AlertCircle }
    if (largePositions > 2) return { level: 'Medium', color: 'text-yellow-400', icon: AlertCircle }
    return { level: 'Low', color: 'text-green-400', icon: AlertCircle }
  }

  const risk = concentrationRisk()
  const RiskIcon = risk.icon

  if (positions.length === 0) {
    return (
      <Card className="premium-card">
        <CardContent className="p-12 text-center">
          <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No positions to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Position Sizing Heatmap
            </CardTitle>
            <CardDescription>
              Tile size represents % of portfolio — visualize position concentration
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <RiskIcon className={`w-4 h-4 ${risk.color}`} />
            <span className="text-sm text-muted-foreground">
              Concentration Risk: <span className={`font-semibold ${risk.color}`}>{risk.level}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              stroke="#0A0E1A"
              fill="#6366f1"
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Professional Legends */}
        <div className="mt-8 space-y-4">
          {/* Size Categories */}
          <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
            <p className="text-sm font-semibold text-white mb-3 text-center">Position Size Categories</p>
            <div className="flex items-center justify-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
                <div className="w-4 h-4 rounded shadow-sm bg-green-500"></div>
                <span className="text-muted-foreground font-medium">Small (1-5%)</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
                <div className="w-4 h-4 rounded shadow-sm bg-blue-500"></div>
                <span className="text-muted-foreground font-medium">Medium (5-10%)</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
                <div className="w-4 h-4 rounded shadow-sm bg-orange-500"></div>
                <span className="text-muted-foreground font-medium">Large (10-15%)</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
                <div className="w-4 h-4 rounded shadow-sm bg-red-500"></div>
                <span className="text-muted-foreground font-medium">Very Large (15%+)</span>
              </div>
            </div>
          </div>

          {/* Sector Colors */}
          <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
            <p className="text-sm font-semibold text-white mb-3 text-center">Sector Distribution</p>
            <div className="flex items-center justify-center gap-3 flex-wrap text-xs">
              {Array.from(new Set(positions.map(p => p.sector))).map(sector => (
                <div key={sector} className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
                  <div 
                    className="w-4 h-4 rounded shadow-sm" 
                    style={{ backgroundColor: getSectorColor(sector) }}
                  ></div>
                  <span className="text-muted-foreground font-medium">{sector}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
