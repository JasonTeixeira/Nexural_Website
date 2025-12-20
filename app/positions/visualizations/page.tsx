'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, GitBranch, Calendar as CalendarIcon, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PortfolioHeatmap } from '@/components/positions/portfolio-heatmap'
import { PositionSizingHeatmap } from '@/components/positions/position-sizing-heatmap'
import { PositionTimeline } from '@/components/positions/position-timeline'
import { TradingCalendar } from '@/components/positions/trading-calendar'
import { MarketHeatmap } from '@/components/positions/market-heatmap'

// Generate realistic dummy data
const generateDummyData = () => {
  const tickers = [
    { ticker: 'NVDA', company: 'NVIDIA Corp', sector: 'Technology' },
    { ticker: 'AAPL', company: 'Apple Inc', sector: 'Technology' },
    { ticker: 'MSFT', company: 'Microsoft Corp', sector: 'Technology' },
    { ticker: 'GOOGL', company: 'Alphabet Inc', sector: 'Technology' },
    { ticker: 'TSLA', company: 'Tesla Inc', sector: 'Consumer' },
    { ticker: 'AMD', company: 'Advanced Micro Devices', sector: 'Technology' },
    { ticker: 'META', company: 'Meta Platforms', sector: 'Technology' },
    { ticker: 'JNJ', company: 'Johnson & Johnson', sector: 'Healthcare' },
    { ticker: 'UNH', company: 'UnitedHealth Group', sector: 'Healthcare' },
    { ticker: 'JPM', company: 'JPMorgan Chase', sector: 'Finance' },
    { ticker: 'BAC', company: 'Bank of America', sector: 'Finance' },
    { ticker: 'XOM', company: 'Exxon Mobil', sector: 'Energy' },
    { ticker: 'CVX', company: 'Chevron Corp', sector: 'Energy' },
    { ticker: 'PFE', company: 'Pfizer Inc', sector: 'Healthcare' },
    { ticker: 'DIS', company: 'Walt Disney Co', sector: 'Consumer' },
    { ticker: 'WMT', company: 'Walmart Inc', sector: 'Consumer' },
    { ticker: 'V', company: 'Visa Inc', sector: 'Finance' },
    { ticker: 'MA', company: 'Mastercard Inc', sector: 'Finance' },
  ]

  const positions = []
  const now = new Date()

  // Generate 18 positions with varied sizes and outcomes
  for (let i = 0; i < 18; i++) {
    const stock = tickers[i % tickers.length]
    const isOpen = i < 6 // First 6 are open positions
    
    // Position sizing - create realistic distribution
    let positionSize
    if (i === 0) positionSize = 18 // One large position
    else if (i < 3) positionSize = 12 // Two more large positions
    else if (i < 8) positionSize = 8 // Medium positions
    else positionSize = 3 + Math.random() * 4 // Small positions
    
    const entryPrice = 50 + Math.random() * 400
    const shares = Math.floor((positionSize * 10000) / entryPrice)
    const positionValue = shares * entryPrice
    
    // Entry date - spread over past 12 months
    const daysAgo = Math.floor(Math.random() * 365)
    const entryDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    let exitDate = null
    let exitPrice = null
    let realized_pnl = null
    let realized_pnl_pct = null
    let unrealized_pnl = null
    let unrealized_pnl_pct = null
    
    if (!isOpen) {
      // Closed position
      const daysHeld = 10 + Math.floor(Math.random() * 60)
      exitDate = new Date(entryDate.getTime() + daysHeld * 24 * 60 * 60 * 1000)
      
      // 60% winners, 40% losers
      const isWinner = Math.random() > 0.4
      const changePercent = isWinner 
        ? 5 + Math.random() * 25 // Winners: 5% to 30%
        : -(2 + Math.random() * 15) // Losers: -2% to -17%
      
      exitPrice = entryPrice * (1 + changePercent / 100)
      realized_pnl = (exitPrice - entryPrice) * shares
      realized_pnl_pct = changePercent
    } else {
      // Open position
      const currentPrice = entryPrice * (0.95 + Math.random() * 0.15) // -5% to +10%
      unrealized_pnl = (currentPrice - entryPrice) * shares
      unrealized_pnl_pct = ((currentPrice - entryPrice) / entryPrice) * 100
    }

    positions.push({
      id: `pos-${i + 1}`,
      ticker: stock.ticker,
      company_name: stock.company,
      sector: stock.sector,
      entry_date: entryDate.toISOString(),
      exit_date: exitDate ? exitDate.toISOString() : null,
      entry_price: entryPrice,
      exit_price: exitPrice,
      shares,
      position_value: positionValue,
      portfolio_percentage: positionSize,
      status: (isOpen ? 'open' : 'closed') as 'open' | 'closed',
      direction: 'long',
      realized_pnl: realized_pnl ?? undefined,
      realized_pnl_pct: realized_pnl_pct ?? undefined,
      unrealized_pnl: unrealized_pnl || 0,
      unrealized_pnl_pct: unrealized_pnl_pct || 0,
    })
  }

  return positions.sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
}

export default function VisualizationsPage() {
  const router = useRouter()
  const [heatmapType, setHeatmapType] = useState<'value' | 'sizing'>('sizing')
  
  // Generate dummy data
  const dummyPositions = generateDummyData()
  const openPositions = dummyPositions.filter(p => p.status === 'open')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Button
          variant="outline"
          onClick={() => router.push('/positions')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Positions
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Position Visualizations</h1>
          <p className="text-muted-foreground text-lg">
            Multiple views to analyze your portfolio — heatmaps, timelines, and calendar
          </p>
          <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primary-foreground">
              <strong>Demo Mode:</strong> Showing sample data with 18 positions for visualization purposes
            </p>
          </div>
        </div>

        {/* View Selection Tabs */}
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-[800px] mb-8">
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market
            </TabsTrigger>
            <TabsTrigger value="heatmaps" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Market Heatmap Tab */}
          <TabsContent value="market">
            <MarketHeatmap userPositions={openPositions.map(p => p.ticker)} />
            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>S&P 500 Market Heatmap:</strong> Finviz-style view showing the entire market at a glance. 
                Tile size represents market cap, color represents daily % change. Your positions are highlighted 
                with yellow borders and dots. See how your holdings compare to the broader market.
              </p>
            </div>
          </TabsContent>

          {/* Portfolio Heatmaps Tab */}
          <TabsContent value="heatmaps" className="space-y-6">
            {/* Heatmap Type Toggle */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Button
                variant={heatmapType === 'value' ? 'default' : 'outline'}
                onClick={() => setHeatmapType('value')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Value-Based Heatmap
              </Button>
              <Button
                variant={heatmapType === 'sizing' ? 'default' : 'outline'}
                onClick={() => setHeatmapType('sizing')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Position Sizing Heatmap
              </Button>
            </div>

            {/* Heatmap Display */}
            {heatmapType === 'value' ? (
              <div>
                <PortfolioHeatmap positions={openPositions} />
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Value-Based Heatmap:</strong> Tile size represents dollar value of position, 
                    color represents profit/loss percentage. Larger tiles = more capital deployed.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <PositionSizingHeatmap positions={openPositions} />
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Position Sizing Heatmap:</strong> Tile size represents percentage of portfolio, 
                    color represents sector. Shows concentration risk and position sizing discipline.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <PositionTimeline positions={dummyPositions} />
            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Position Timeline:</strong> Chronological view showing when positions were entered and exited. 
                Green bars = closed winners, Red bars = closed losers, Blue/Orange/Gray = open positions. 
                Hover over any bar for detailed information.
              </p>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <TradingCalendar />
            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Trading Calendar:</strong> Monthly view of all trading events including entries, exits, 
                scale-ins/outs, and stops. Navigate between months to see historical activity.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 glass-card border border-border rounded-lg">
            <p className="text-3xl font-bold text-white">
              {dummyPositions.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Total Positions</p>
          </div>
          <div className="text-center p-6 glass-card border border-border rounded-lg">
            <p className="text-3xl font-bold text-blue-400">
              {openPositions.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Currently Open</p>
          </div>
          <div className="text-center p-6 glass-card border border-border rounded-lg">
            <p className="text-3xl font-bold text-green-400">
              {dummyPositions.filter(p => p.realized_pnl && p.realized_pnl > 0).length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Closed Winners</p>
          </div>
          <div className="text-center p-6 glass-card border border-border rounded-lg">
            <p className="text-3xl font-bold text-primary">
              {Array.from(new Set(dummyPositions.map(p => p.sector))).length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Sectors</p>
          </div>
        </div>
      </div>
    </div>
  )
}
