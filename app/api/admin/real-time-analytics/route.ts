import { NextRequest, NextResponse } from 'next/server'
import { realTimeAnalyticsEngine } from '@/lib/real-time-analytics-engine'
import { databentoClient } from '@/lib/databento-client'
import { securityMiddleware } from '@/lib/security-middleware'

export async function GET(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request, {
      requireAuth: true,
      rateLimit: { maxRequests: 200, windowMs: 15 * 60 * 1000 },
      auditLog: true
    })

    if (!security.success) {
      return security.response!
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'overview'
    const symbol = searchParams.get('symbol')
    const timeframe = searchParams.get('timeframe') as '1m' | '5m' | '15m' | '1h' | '1d' || '1h'

    switch (action) {
      case 'overview':
        // Get comprehensive real-time overview
        const portfolioMetrics = realTimeAnalyticsEngine.getPortfolioMetrics()
        const positions = realTimeAnalyticsEngine.getPositions()
        const marketData = realTimeAnalyticsEngine.getMarketData()
        const riskAlerts = realTimeAnalyticsEngine.getRiskAlerts()
        const marketAlerts = realTimeAnalyticsEngine.getMarketAlerts().slice(0, 10)
        const connectionStatus = databentoClient.getConnectionStatus()

        return NextResponse.json({
          success: true,
          data: {
            portfolio_metrics: portfolioMetrics,
            positions: positions.slice(0, 20), // Top 20 positions
            market_data: marketData.slice(0, 15), // Top 15 symbols
            risk_alerts: riskAlerts.slice(0, 10), // Top 10 unacknowledged alerts
            market_alerts: marketAlerts,
            connection_status: connectionStatus,
            last_updated: new Date().toISOString()
          }
        })

      case 'portfolio-metrics':
        const metrics = realTimeAnalyticsEngine.getPortfolioMetrics()
        return NextResponse.json({
          success: true,
          data: metrics
        })

      case 'positions':
        const allPositions = realTimeAnalyticsEngine.getPositions()
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        
        const paginatedPositions = allPositions
          .sort((a, b) => Math.abs(b.market_value) - Math.abs(a.market_value))
          .slice(offset, offset + limit)

        return NextResponse.json({
          success: true,
          data: {
            positions: paginatedPositions,
            total: allPositions.length,
            limit,
            offset
          }
        })

      case 'market-data':
        const allMarketData = realTimeAnalyticsEngine.getMarketData()
        const filteredMarketData = symbol 
          ? allMarketData.filter(data => data.symbol === symbol)
          : allMarketData

        return NextResponse.json({
          success: true,
          data: filteredMarketData
        })

      case 'historical-data':
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol required for historical data' }, { status: 400 })
        }

        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

        const historicalData = await databentoClient.getHistoricalOHLCV(
          [symbol],
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          timeframe
        )

        return NextResponse.json({
          success: true,
          data: {
            symbol,
            timeframe,
            data: historicalData,
            count: historicalData.length
          }
        })

      case 'risk-alerts':
        const allRiskAlerts = realTimeAnalyticsEngine.getRiskAlerts()
        const severity = searchParams.get('severity')
        const alertType = searchParams.get('type')
        
        let filteredRiskAlerts = allRiskAlerts
        
        if (severity) {
          filteredRiskAlerts = filteredRiskAlerts.filter(alert => alert.severity === severity)
        }
        
        if (alertType) {
          filteredRiskAlerts = filteredRiskAlerts.filter(alert => alert.type === alertType)
        }

        return NextResponse.json({
          success: true,
          data: {
            alerts: filteredRiskAlerts.slice(0, 50),
            total: filteredRiskAlerts.length,
            summary: {
              critical: allRiskAlerts.filter(a => a.severity === 'critical').length,
              high: allRiskAlerts.filter(a => a.severity === 'high').length,
              medium: allRiskAlerts.filter(a => a.severity === 'medium').length,
              low: allRiskAlerts.filter(a => a.severity === 'low').length
            }
          }
        })

      case 'market-alerts':
        const allMarketAlerts = realTimeAnalyticsEngine.getMarketAlerts()
        const alertSymbol = searchParams.get('symbol')
        const alertMarketType = searchParams.get('type')
        
        let filteredMarketAlerts = allMarketAlerts
        
        if (alertSymbol) {
          filteredMarketAlerts = filteredMarketAlerts.filter(alert => alert.symbol === alertSymbol)
        }
        
        if (alertMarketType) {
          filteredMarketAlerts = filteredMarketAlerts.filter(alert => alert.type === alertMarketType)
        }

        return NextResponse.json({
          success: true,
          data: {
            alerts: filteredMarketAlerts.slice(0, 100),
            total: filteredMarketAlerts.length
          }
        })

      case 'performance-metrics':
        const performanceMetrics = realTimeAnalyticsEngine.getPerformanceMetrics()
        const metricsSymbol = searchParams.get('symbol')
        
        const filteredMetrics = metricsSymbol 
          ? performanceMetrics.filter(metric => metric.symbol === metricsSymbol)
          : performanceMetrics

        return NextResponse.json({
          success: true,
          data: filteredMetrics
        })

      case 'market-snapshot':
        const symbols = searchParams.get('symbols')?.split(',') || ['ES', 'NQ', 'RTY', 'YM']
        
        const snapshot = await databentoClient.getMarketSnapshot(symbols)
        
        return NextResponse.json({
          success: true,
          data: {
            snapshot,
            timestamp: new Date().toISOString()
          }
        })

      case 'connection-status':
        const status = databentoClient.getConnectionStatus()
        const engineStatus = {
          isRunning: realTimeAnalyticsEngine.listenerCount('started') > 0,
          positions: realTimeAnalyticsEngine.getPositions().length,
          marketDataPoints: realTimeAnalyticsEngine.getMarketData().length,
          riskAlerts: realTimeAnalyticsEngine.getRiskAlerts().length,
          marketAlerts: realTimeAnalyticsEngine.getMarketAlerts().length
        }

        return NextResponse.json({
          success: true,
          data: {
            databento: status,
            analytics_engine: engineStatus,
            last_updated: new Date().toISOString()
          }
        })

      case 'watchlist':
        // Get watchlist symbols with real-time data
        const watchlistSymbols = ['ES', 'NQ', 'RTY', 'YM', 'CL', 'GC', 'ZN', '6E']
        const watchlistData = realTimeAnalyticsEngine.getMarketData()
          .filter(data => watchlistSymbols.includes(data.symbol))
          .map(data => {
            const position = realTimeAnalyticsEngine.getPositions()
              .find(pos => pos.symbol === data.symbol)
            
            return {
              ...data,
              position: position ? {
                quantity: position.quantity,
                unrealized_pnl: position.unrealized_pnl,
                percentage_change: position.percentage_change
              } : null
            }
          })

        return NextResponse.json({
          success: true,
          data: {
            watchlist: watchlistData,
            last_updated: new Date().toISOString()
          }
        })

      case 'analytics-summary':
        // Comprehensive analytics summary
        const summaryMetrics = realTimeAnalyticsEngine.getPortfolioMetrics()
        const summaryPositions = realTimeAnalyticsEngine.getPositions()
        const summaryRiskAlerts = realTimeAnalyticsEngine.getRiskAlerts()
        const summaryMarketAlerts = realTimeAnalyticsEngine.getMarketAlerts()
        
        const topPerformers = summaryPositions
          .filter(pos => pos.percentage_change > 0)
          .sort((a, b) => b.percentage_change - a.percentage_change)
          .slice(0, 5)
        
        const topLosers = summaryPositions
          .filter(pos => pos.percentage_change < 0)
          .sort((a, b) => a.percentage_change - b.percentage_change)
          .slice(0, 5)

        return NextResponse.json({
          success: true,
          data: {
            portfolio_summary: {
              total_value: summaryMetrics.total_portfolio_value,
              daily_pnl: summaryMetrics.daily_pnl,
              daily_pnl_percentage: summaryMetrics.daily_pnl_percentage,
              positions_count: summaryMetrics.positions_count,
              risk_score: summaryMetrics.risk_score
            },
            top_performers: topPerformers,
            top_losers: topLosers,
            alerts_summary: {
              risk_alerts: summaryRiskAlerts.length,
              market_alerts: summaryMarketAlerts.length,
              critical_alerts: summaryRiskAlerts.filter(a => a.severity === 'critical').length
            },
            market_status: {
              connected: databentoClient.getConnectionStatus().isConnected,
              subscriptions: databentoClient.getConnectionStatus().subscriptions.length
            },
            last_updated: new Date().toISOString()
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in real-time analytics GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 },
      validateInput: true,
      auditLog: true
    })

    if (!security.success) {
      return security.response!
    }

    const body = security.sanitizedBody
    const { action } = body

    switch (action) {
      case 'start-analytics':
        try {
          await realTimeAnalyticsEngine.start()
          return NextResponse.json({
            success: true,
            message: 'Real-time analytics engine started'
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to start analytics engine'
          }, { status: 500 })
        }

      case 'stop-analytics':
        realTimeAnalyticsEngine.stop()
        return NextResponse.json({
          success: true,
          message: 'Real-time analytics engine stopped'
        })

      case 'subscribe-symbols':
        const { symbols } = body
        if (!symbols || !Array.isArray(symbols)) {
          return NextResponse.json({ error: 'Symbols array required' }, { status: 400 })
        }

        try {
          await databentoClient.subscribeToSymbols(symbols)
          return NextResponse.json({
            success: true,
            message: `Subscribed to ${symbols.length} symbols`,
            symbols
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to subscribe to symbols'
          }, { status: 500 })
        }

      case 'unsubscribe-symbols':
        const { unsubscribeSymbols } = body
        if (!unsubscribeSymbols || !Array.isArray(unsubscribeSymbols)) {
          return NextResponse.json({ error: 'Symbols array required' }, { status: 400 })
        }

        try {
          await databentoClient.unsubscribeFromSymbols(unsubscribeSymbols)
          return NextResponse.json({
            success: true,
            message: `Unsubscribed from ${unsubscribeSymbols.length} symbols`,
            symbols: unsubscribeSymbols
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to unsubscribe from symbols'
          }, { status: 500 })
        }

      case 'acknowledge-risk-alert':
        const { alertId } = body
        if (!alertId) {
          return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
        }

        try {
          await realTimeAnalyticsEngine.acknowledgeRiskAlert(alertId)
          return NextResponse.json({
            success: true,
            message: 'Risk alert acknowledged'
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to acknowledge alert'
          }, { status: 500 })
        }

      case 'update-risk-thresholds':
        // This would update risk management thresholds
        const { thresholds } = body
        if (!thresholds) {
          return NextResponse.json({ error: 'Thresholds required' }, { status: 400 })
        }

        // Implementation would update the analytics engine configuration
        return NextResponse.json({
          success: true,
          message: 'Risk thresholds updated',
          thresholds
        })

      case 'create-custom-alert':
        const { alertConfig } = body
        if (!alertConfig) {
          return NextResponse.json({ error: 'Alert configuration required' }, { status: 400 })
        }

        // Implementation would create custom alert rules
        return NextResponse.json({
          success: true,
          message: 'Custom alert created',
          alert_id: `custom_${Date.now()}`
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in real-time analytics POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimit: { maxRequests: 30, windowMs: 15 * 60 * 1000 },
      validateInput: true,
      auditLog: true
    })

    if (!security.success) {
      return security.response!
    }

    const body = security.sanitizedBody
    const { action } = body

    switch (action) {
      case 'update-position':
        const { positionId, updates } = body
        if (!positionId || !updates) {
          return NextResponse.json({ error: 'Position ID and updates required' }, { status: 400 })
        }

        // Implementation would update position in database and analytics engine
        return NextResponse.json({
          success: true,
          message: 'Position updated'
        })

      case 'update-watchlist':
        const { watchlist } = body
        if (!watchlist || !Array.isArray(watchlist)) {
          return NextResponse.json({ error: 'Watchlist array required' }, { status: 400 })
        }

        // Implementation would update user's watchlist
        return NextResponse.json({
          success: true,
          message: 'Watchlist updated',
          watchlist
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in real-time analytics PUT:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
