'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface Position {
  ticker: string
  company_name: string
  position_value: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  sector: string
}

interface PortfolioHeatmapProps {
  positions: Position[]
}

export function PortfolioHeatmap({ positions }: PortfolioHeatmapProps) {
  // Transform positions data for treemap
  const treemapData = positions.map((position) => ({
    name: position.ticker,
    size: position.position_value || 0,
    pnlPct: position.unrealized_pnl_pct || 0,
    pnl: position.unrealized_pnl || 0,
    sector: position.sector,
    companyName: position.company_name,
  }))

  // Professional dark color palette - high contrast for readability
  const getColor = (pnlPct: number) => {
    if (pnlPct >= 10) return '#047857'  // Dark forest green (emerald 700)
    if (pnlPct >= 5) return '#059669'   // Dark green (emerald 600)
    if (pnlPct >= 2) return '#10b981'   // Medium green (emerald 500)
    if (pnlPct >= 0) return '#34d399'   // Light green (emerald 400)
    if (pnlPct >= -2) return '#fbbf24'  // Yellow (amber 400)
    if (pnlPct >= -5) return '#f97316'  // Orange (orange 500)
    if (pnlPct >= -10) return '#ea580c' // Dark orange (orange 600)
    return '#dc2626'                    // Dark red (red 600)
  }

  // Custom content for each cell
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, pnlPct, size, companyName } = props

    // Don't render if too small
    if (width < 50 || height < 30) return null

    const fontSize = width < 100 ? '12px' : '14px'
    const showCompany = width > 150 && height > 50

    return (
      <g className="tile-group">
        {/* Main tile with gradient */}
        <defs>
          <linearGradient id={`gradient-${name}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: getColor(pnlPct), stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: getColor(pnlPct), stopOpacity: 0.85 }} />
          </linearGradient>
          <filter id={`shadow-${name}`} x="-50%" y="-50%" width="200%" height="200%">
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
          rx="8"
          ry="8"
          style={{
            fill: `url(#gradient-${name})`,
            stroke: 'rgba(0, 0, 0, 0.4)',
            strokeWidth: 2.5,
            filter: `url(#shadow-${name})`,
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
            fill: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />
        {/* Text with shadow for better readability */}
        <text
          x={x + width / 2}
          y={y + height / 2 - (showCompany ? 12 : 0)}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={width < 100 ? '13px' : '15px'}
          fontWeight="700"
          style={{ 
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            letterSpacing: '0.5px'
          }}
        >
          {name}
        </text>
        {showCompany && companyName && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 4}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.85)"
            fontSize="10px"
            fontWeight="500"
          >
            {companyName.length > 20 ? companyName.substring(0, 20) + '...' : companyName}
          </text>
        )}
        {pnlPct !== undefined && pnlPct !== null && (
          <text
            x={x + width / 2}
            y={y + height / 2 + (showCompany ? 22 : 16)}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={width < 100 ? '13px' : '15px'}
            fontWeight="700"
            style={{ 
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              letterSpacing: '0.3px'
            }}
          >
            {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
          </text>
        )}
      </g>
    )
  }

  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: getColor(data.pnlPct) }}
            />
            <p className="font-bold text-white text-base">{data.name}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-3 pl-5">{data.companyName}</p>
          <div className="space-y-2 text-sm pl-5">
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Position Value:</span>
              <span className="text-white font-bold">
                ${data.size.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">P&L:</span>
              <span className={`font-bold text-base ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">P&L %:</span>
              <span className={`font-bold text-base ${data.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.pnlPct >= 0 ? '+' : ''}{data.pnlPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Sector:</span>
              <span className="text-white font-medium">{data.sector}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (positions.length === 0) {
    return null
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Portfolio Heatmap
        </CardTitle>
        <CardDescription>
          Position size and performance visualization — larger tiles = bigger positions, color = P&L
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px]">
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

        {/* Professional Legend - Updated to match new color palette */}
        <div className="mt-8 p-4 bg-card/50 border border-border/50 rounded-lg">
          <p className="text-sm font-semibold text-white mb-3 text-center">Performance Scale</p>
          <div className="flex items-center justify-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
              <div className="w-4 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: '#047857' }}></div>
              <span className="text-muted-foreground font-medium">+10%+</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
              <div className="w-4 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-muted-foreground font-medium">+2% to +10%</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
              <div className="w-4 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: '#34d399' }}></div>
              <span className="text-muted-foreground font-medium">0% to +2%</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
              <div className="w-4 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: '#fbbf24' }}></div>
              <span className="text-muted-foreground font-medium">-2% to 0%</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
              <div className="w-4 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: '#f97316' }}></div>
              <span className="text-muted-foreground font-medium">-5% to -2%</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/30">
              <div className="w-4 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: '#dc2626' }}></div>
              <span className="text-muted-foreground font-medium">-10% or worse</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
