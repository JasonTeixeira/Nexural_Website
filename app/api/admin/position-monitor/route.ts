import { NextRequest, NextResponse } from 'next/server'
import { positionManager, startPriceMonitoring } from '@/lib/position-manager'

// Professional Position Monitoring API
// Manages automated stop loss updates, target hit detection, and Discord notifications

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'status') {
      // Get monitoring status
      const status = positionManager.getMonitoringStatus()
      
      return NextResponse.json({
        success: true,
        status: 'active',
        monitoring: status,
        message: 'Position monitoring system operational'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Professional Position Monitoring System',
      endpoints: {
        'GET ?action=status': 'Get monitoring status',
        'POST': 'Start/restart monitoring',
        'PUT': 'Update position prices manually',
        'DELETE': 'Stop monitoring'
      },
      features: [
        'Automated stop loss to breakeven',
        'Target hit detection and notifications',
        'Real-time Discord updates',
        'Professional P&L calculations',
        'Multi-asset support (17 symbols)'
      ]
    })

  } catch (error) {
    console.error('Error in position monitor GET:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get monitoring status'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'start') {
      // Start position monitoring system
      await startPriceMonitoring()
      
      return NextResponse.json({
        success: true,
        message: 'Position monitoring system started',
        status: 'active'
      })
    }

    if (action === 'add_position') {
      // Add new position to monitoring
      await positionManager.addPosition(data)
      
      return NextResponse.json({
        success: true,
        message: `Position added to monitoring: ${data.symbol}`,
        position: data
      })
    }

    if (action === 'price_update') {
      // Manual price update for testing
      const { symbol, price } = data
      
      await positionManager.processPriceUpdate({
        symbol,
        price: parseFloat(price),
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: `Price updated for ${symbol}: $${price}`,
        update: { symbol, price, timestamp: new Date().toISOString() }
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: start, add_position, or price_update'
    }, { status: 400 })

  } catch (error) {
    console.error('Error in position monitor POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process monitoring request'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, price } = body

    if (!symbol || !price) {
      return NextResponse.json({
        error: 'Symbol and price are required'
      }, { status: 400 })
    }

    // Update price for specific symbol
    await positionManager.processPriceUpdate({
      symbol: symbol.toUpperCase(),
      price: parseFloat(price),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Price updated for ${symbol}`,
      update: {
        symbol: symbol.toUpperCase(),
        price: parseFloat(price),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in position monitor PUT:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update price'
    }, { status: 500 })
  }
}

// Test endpoint for ALL 17 CHANNELS professional system
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, symbol } = body

    if (action === 'test_all_17_channels') {
      // Create test positions for ALL 17 symbols
      const testPositions = [
        // Equity Indices
        {
          id: 'test-es-' + Date.now(),
          symbol: 'ES',
          entry_price: 4500.00,
          current_price: 4500.00,
          stop_loss: 4485.00, // 15 point stop
          target_price_1: 4522.50, // 1.5R
          target_price_2: 4537.50, // 2.5R
          target_price_3: 4552.50, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-nq-' + Date.now(),
          symbol: 'NQ',
          entry_price: 15000.00,
          current_price: 15000.00,
          stop_loss: 14950.00, // 50 point stop
          target_price_1: 15075.00, // 1.5R
          target_price_2: 15125.00, // 2.5R
          target_price_3: 15175.00, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-rty-' + Date.now(),
          symbol: 'RTY',
          entry_price: 2000.00,
          current_price: 2000.00,
          stop_loss: 1985.00, // 15 point stop
          target_price_1: 2022.50, // 1.5R
          target_price_2: 2037.50, // 2.5R
          target_price_3: 2052.50, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-ym-' + Date.now(),
          symbol: 'YM',
          entry_price: 35000.00,
          current_price: 35000.00,
          stop_loss: 34850.00, // 150 point stop
          target_price_1: 35225.00, // 1.5R
          target_price_2: 35375.00, // 2.5R
          target_price_3: 35525.00, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        // Energy
        {
          id: 'test-cl-' + Date.now(),
          symbol: 'CL',
          entry_price: 75.00,
          current_price: 75.00,
          stop_loss: 74.25, // 0.75 stop
          target_price_1: 76.13, // 1.5R
          target_price_2: 76.88, // 2.5R
          target_price_3: 77.63, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-ng-' + Date.now(),
          symbol: 'NG',
          entry_price: 3.50,
          current_price: 3.50,
          stop_loss: 3.40, // 0.10 stop
          target_price_1: 3.65, // 1.5R
          target_price_2: 3.75, // 2.5R
          target_price_3: 3.85, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        // Metals
        {
          id: 'test-gc-' + Date.now(),
          symbol: 'GC',
          entry_price: 2000.00,
          current_price: 2000.00,
          stop_loss: 1985.00, // 15 point stop
          target_price_1: 2022.50, // 1.5R
          target_price_2: 2037.50, // 2.5R
          target_price_3: 2052.50, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-si-' + Date.now(),
          symbol: 'SI',
          entry_price: 25.00,
          current_price: 25.00,
          stop_loss: 24.50, // 0.50 stop
          target_price_1: 25.75, // 1.5R
          target_price_2: 26.25, // 2.5R
          target_price_3: 26.75, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-hg-' + Date.now(),
          symbol: 'HG',
          entry_price: 4.00,
          current_price: 4.00,
          stop_loss: 3.90, // 0.10 stop
          target_price_1: 4.15, // 1.5R
          target_price_2: 4.25, // 2.5R
          target_price_3: 4.35, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        // Agriculture
        {
          id: 'test-zc-' + Date.now(),
          symbol: 'ZC',
          entry_price: 450.00,
          current_price: 450.00,
          stop_loss: 440.00, // 10 point stop
          target_price_1: 465.00, // 1.5R
          target_price_2: 475.00, // 2.5R
          target_price_3: 485.00, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-zs-' + Date.now(),
          symbol: 'ZS',
          entry_price: 1200.00,
          current_price: 1200.00,
          stop_loss: 1175.00, // 25 point stop
          target_price_1: 1237.50, // 1.5R
          target_price_2: 1262.50, // 2.5R
          target_price_3: 1287.50, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-zw-' + Date.now(),
          symbol: 'ZW',
          entry_price: 600.00,
          current_price: 600.00,
          stop_loss: 585.00, // 15 point stop
          target_price_1: 622.50, // 1.5R
          target_price_2: 637.50, // 2.5R
          target_price_3: 652.50, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        // Bonds
        {
          id: 'test-zn-' + Date.now(),
          symbol: 'ZN',
          entry_price: 110.00,
          current_price: 110.00,
          stop_loss: 109.50, // 0.50 stop
          target_price_1: 110.75, // 1.5R
          target_price_2: 111.25, // 2.5R
          target_price_3: 111.75, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        // Currencies
        {
          id: 'test-eur-' + Date.now(),
          symbol: 'EUR',
          entry_price: 1.0800,
          current_price: 1.0800,
          stop_loss: 1.0750, // 50 pip stop
          target_price_1: 1.0875, // 1.5R
          target_price_2: 1.0925, // 2.5R
          target_price_3: 1.0975, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-jpy-' + Date.now(),
          symbol: 'JPY',
          entry_price: 150.00,
          current_price: 150.00,
          stop_loss: 149.00, // 100 pip stop
          target_price_1: 151.50, // 1.5R
          target_price_2: 152.50, // 2.5R
          target_price_3: 153.50, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        // Crypto
        {
          id: 'test-btc-' + Date.now(),
          symbol: 'BTC',
          entry_price: 45000.00,
          current_price: 45000.00,
          stop_loss: 44000.00, // 1000 point stop
          target_price_1: 46500.00, // 1.5R
          target_price_2: 47500.00, // 2.5R
          target_price_3: 48500.00, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-eth-' + Date.now(),
          symbol: 'ETH',
          entry_price: 2500.00,
          current_price: 2500.00,
          stop_loss: 2400.00, // 100 point stop
          target_price_1: 2650.00, // 1.5R
          target_price_2: 2750.00, // 2.5R
          target_price_3: 2850.00, // 3.5R
          position_size: 1,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        }
      ]

      // Add all positions to monitoring
      for (const position of testPositions) {
        await positionManager.addPosition(position)
      }

      return NextResponse.json({
        success: true,
        message: 'ALL 17 CHANNELS test positions created and added to monitoring',
        totalPositions: testPositions.length,
        positions: testPositions,
        instructions: {
          'Test All Channels': 'All 17 symbols now have active positions being monitored',
          'Test Breakeven': 'Use PUT /api/admin/position-monitor to update prices',
          'Example': 'PUT with {symbol: "ES", price: 4511.25} to trigger breakeven',
          'Symbols': testPositions.map(p => p.symbol).join(', ')
        }
      })
    }

    if (action === 'simulate_breakeven') {
      // Simulate breakeven move for specified symbol
      const priceMap: Record<string, number> = {
        'ES': 4511.25, 'NQ': 15037.50, 'RTY': 2011.25, 'YM': 35112.50,
        'CL': 75.56, 'NG': 3.58, 'GC': 2011.25, 'SI': 25.38, 'HG': 4.08,
        'ZC': 457.50, 'ZS': 1218.75, 'ZW': 611.25, 'ZN': 110.38,
        'EUR': 1.0838, 'JPY': 150.75, 'BTC': 45750.00, 'ETH': 2575.00
      }

      const targetSymbol = symbol || 'ES'
      const breakevenPrice = priceMap[targetSymbol] || 4511.25

      await positionManager.processPriceUpdate({
        symbol: targetSymbol,
        price: breakevenPrice,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: `Simulated breakeven move for ${targetSymbol}`,
        price: breakevenPrice,
        action: 'Stop should move to breakeven'
      })
    }

    if (action === 'simulate_target') {
      // Simulate target hit for specified symbol
      const targetMap: Record<string, number> = {
        'ES': 4522.50, 'NQ': 15075.00, 'RTY': 2022.50, 'YM': 35225.00,
        'CL': 76.13, 'NG': 3.65, 'GC': 2022.50, 'SI': 25.75, 'HG': 4.15,
        'ZC': 465.00, 'ZS': 1237.50, 'ZW': 622.50, 'ZN': 110.75,
        'EUR': 1.0875, 'JPY': 151.50, 'BTC': 46500.00, 'ETH': 2650.00
      }

      const targetSymbol = symbol || 'ES'
      const targetPrice = targetMap[targetSymbol] || 4522.50

      await positionManager.processPriceUpdate({
        symbol: targetSymbol,
        price: targetPrice,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: `Simulated T1 hit for ${targetSymbol}`,
        price: targetPrice,
        action: 'Target 1 should be hit'
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: test_all_17_channels, simulate_breakeven, or simulate_target'
    }, { status: 400 })

  } catch (error) {
    console.error('Error in position monitor PATCH:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to run test'
    }, { status: 500 })
  }
}
