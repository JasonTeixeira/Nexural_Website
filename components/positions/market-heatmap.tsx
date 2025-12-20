'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MarketHeatmapProps {
  userPositions?: string[] // Array of tickers user owns
}

// Generate realistic S&P 500 market data
const generateMarketData = () => {
  const sectors = [
    { name: 'Technology', stocks: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'CSCO', 'ORCL', 'ADBE'] },
    { name: 'Healthcare', stocks: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'MRK', 'ABT', 'LLY', 'DHR', 'BMY'] },
    { name: 'Finance', stocks: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'AXP', 'SCHW', 'USB'] },
    { name: 'Consumer', stocks: ['AMZN', 'TSLA', 'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'DIS'] },
    { name: 'Energy', stocks: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL'] },
    { name: 'Industrials', stocks: ['BA', 'CAT', 'UNP', 'HON', 'UPS', 'RTX', 'LMT', 'DE', 'MMM', 'GE'] },
    { name: 'Materials', stocks: ['LIN', 'APD', 'ECL', 'SHW', 'NEM', 'FCX', 'DD', 'DOW', 'PPG', 'ALB'] },
    { name: 'Utilities', stocks: ['NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'EXC', 'XEL', 'ED', 'PEG'] },
    { name: 'Real Estate', stocks: ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'WELL', 'DLR', 'O', 'VICI'] },
    { name: 'Telecom', stocks: ['TMUS', 'VZ', 'T', 'CHTR'] },
    { name: 'Staples', stocks: ['PG', 'KO', 'PEP', 'COST', 'WMT', 'PM', 'MO', 'CL', 'MDLZ', 'KMB'] },
  ]

  const marketData: any[] = []

  sectors.forEach(sector => {
    sector.stocks.forEach((ticker, index) => {
      // Simulate market cap (larger = more prominent in treemap)
      const marketCap = Math.random() * 2000 + 100 // $100B to $2.1T
      
      // Simulate daily % change (realistic distribution)
      let changePercent
      const rand = Math.random()
      if (rand < 0.15) changePercent = -3 - Math.random() * 4 // 15% big losers (-3% to -7%)
      else if (rand < 0.35) changePercent = -1 - Math.random() * 2 // 20% moderate losers (-1% to -3%)
      else if (rand < 0.65) changePercent = -0.5 + Math.random() * 1 // 30% flat (-0.5% to +0.5%)
      else if (rand < 0.85) changePercent = 0.5 + Math.random() * 2.5 // 20% moderate winners (+0.5% to +3%)
      else changePercent = 3 + Math.random() * 4 // 15% big winners (+3% to +7%)

      marketData.push({
        ticker,
        sector: sector.name,
        marketCap,
        changePercent,
        price: 50 + Math.random() * 450,
      })
    })
  })

  return marketData
}

export function MarketHeatmap({ userPositions = [] }: MarketHeatmapProps) {
  const marketData = generateMarketData()

  // Get color based on % change
  const getColor = (changePct: number) => {
    if (changePct >= 4) return '#00C851' // Bright green
    if (changePct >= 2) return '#22c55e' // Green
    if (changePct >= 1) return '#84cc16' // Light green
    if (changePct >= 0.5) return '#a3e635' // Yellow-green
    if (changePct >= -0.5) return '#9ca3af' // Gray (flat)
    if (changePct >= -1) return '#fbbf24' // Yellow
    if (changePct >= -2) return '#f59e0b' // Orange
    if (changePct >= -4) return '#f97316' // Dark orange
    return '#ef4444' // Red
  }

  // Custom content for each cell
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, ticker, changePercent, sector } = props

    // Don't render if too small
    if (width < 40 || height < 25) return null

    const isUserPosition = userPositions.includes(ticker)

    return (
      <g className="tile-group">
        {/* Gradients and filters */}
        <defs>
          <linearGradient id={`market-gradient-${ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: getColor(changePercent), stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: getColor(changePercent), stopOpacity: 0.85 }} />
          </linearGradient>
          <filter id={`market-shadow-${ticker}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Base rectangle */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx="4"
          ry="4"
          style={{
            fill: `url(#market-gradient-${ticker})`,
            stroke: isUserPosition ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)',
            strokeWidth: isUserPosition ? 2.5 : 1,
            filter: `url(#market-shadow-${ticker})`,
          }}
        />

        {/* User position indicator */}
        {isUserPosition && (
          <circle
            cx={x + 8}
            cy={y + 8}
            r="3"
            fill="#fbbf24"
            stroke="#fff"
            strokeWidth="1"
          />
        )}
        
        {/* Subtle shine overlay */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height * 0.35}
          rx="4"
          ry="4"
          style={{
            fill: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />

        {/* Ticker */}
        {width > 45 && (
          <text
            x={x + width / 2}
            y={y + height / 2 - 3}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={width > 60 ? '11px' : '9px'}
            fontWeight="700"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              letterSpacing: '0.3px'
            }}
          >
            {ticker}
          </text>
        )}

        {/* % Change */}
        {width > 45 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={width > 60 ? '10px' : '8px'}
            fontWeight="600"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </text>
        )}
      </g>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isUserPosition = userPositions.includes(data.ticker)
      
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: getColor(data.changePercent) }}
            />
            <p className="font-bold text-white text-base">{data.ticker}</p>
            {isUserPosition && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Your Position
              </Badge>
            )}
          </div>
          
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Sector:</span>
              <span className="text-white font-medium">{data.sector}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Price:</span>
              <span className="text-white font-medium">${data.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Change:</span>
              <span className={`font-bold text-base ${data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Market Cap:</span>
              <span className="text-white font-medium">${(data.marketCap / 1000).toFixed(1)}T</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate market stats
  const avgChange = marketData.reduce((sum, s) => sum + s.changePercent, 0) / marketData.length
  const gainers = marketData.filter(s => s.changePercent > 0).length
  const losers = marketData.filter(s => s.changePercent < 0).length
  const userStocksInView = marketData.filter(s => userPositions.includes(s.ticker)).length

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              S&P 500 Market Heatmap
            </CardTitle>
            <CardDescription>
              Real-time market overview — tile size by market cap, color by daily % change
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Market Average</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Market Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{gainers}</div>
            <div className="text-xs text-muted-foreground">Gainers</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{losers}</div>
            <div className="text-xs text-muted-foreground">Losers</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">{userStocksInView}</div>
            <div className="text-xs text-muted-foreground">Your Positions</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="w-full h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={marketData}
              dataKey="marketCap"
              stroke="#0A0E1A"
              fill="#6366f1"
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-card/50 border border-border/50 rounded-lg">
          <p className="text-sm font-semibold text-white mb-3 text-center">Performance Scale</p>
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/30">
              <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: '#00C851' }}></div>
              <span className="text-muted-foreground font-medium">+4%+</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/30">
              <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: '#22c55e' }}></div>
              <span className="text-muted-foreground font-medium">+2% to +4%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/30">
              <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: '#a3e635' }}></div>
              <span className="text-muted-foreground font-medium">0% to +2%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/30">
              <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: '#9ca3af' }}></div>
              <span className="text-muted-foreground font-medium">Flat</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/30">
              <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-muted-foreground font-medium">-2% to 0%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/30">
              <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: '#f97316' }}></div>
              <span className="text-muted-foreground font-medium">-2% to -4%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/30">
              <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-muted-foreground font-medium">-4% or worse</span>
            </div>
          </div>
          
          {userStocksInView > 0 && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground font-medium">= Your Position</span>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-xs text-primary-foreground text-center">
            <strong>Demo Mode:</strong> Showing simulated S&P 500 data. Integrate Polygon.io or Alpha Vantage API for live data.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
