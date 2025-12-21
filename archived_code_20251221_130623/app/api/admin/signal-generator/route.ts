import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FallbackAuth } from '@/lib/fallback-auth'
import { deliverSignal, TradingSignal } from '@/lib/signal-delivery-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using cookies (same as admin dashboard)
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const isValid = await FallbackAuth.verifyToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get signal generator status and configuration
    const { data: configs, error } = await supabase
      .from('system_config')
      .select('config_key, config_value, config_type')
      .in('config_key', [
        'SIGNAL_GENERATOR_ACTIVE',
        'MIN_CONFIDENCE_THRESHOLD',
        'CVD_FILTER_ENABLED',
        'CVD_THRESHOLD',
        'AUTO_SEND_ENABLED'
      ])

    if (error) {
      console.error('Error fetching signal generator config:', error)
      return NextResponse.json({
        status: 'unknown',
        active: false,
        config: {
          minConfidence: 75,
          enableCVDFilter: true,
          cvdThreshold: 0.5,
          autoSendEnabled: true
        },
        message: 'Configuration table not found'
      })
    }

    // Parse configuration
    const configMap = (configs || []).reduce((acc, config) => {
      let value = config.config_value
      if (config.config_type === 'boolean') {
        value = value === 'true'
      } else if (config.config_type === 'number') {
        value = parseFloat(value)
      }
      acc[config.config_key] = value
      return acc
    }, {} as Record<string, any>)

    const isActive = configMap['SIGNAL_GENERATOR_ACTIVE'] === true
    const status = isActive ? 'running' : 'stopped'

    const response = {
      status,
      active: isActive,
      config: {
        minConfidence: configMap['MIN_CONFIDENCE_THRESHOLD'] || 75,
        enableCVDFilter: configMap['CVD_FILTER_ENABLED'] !== false,
        cvdThreshold: configMap['CVD_THRESHOLD'] || 0.5,
        autoSendEnabled: configMap['AUTO_SEND_ENABLED'] !== false
      },
      lastUpdate: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/admin/signal-generator:', error)
    return NextResponse.json({ 
      status: 'error',
      active: false,
      error: 'Failed to fetch signal generator status'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using cookies (same as admin dashboard)
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const isValid = await FallbackAuth.verifyToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { action, config } = body

    if (action === 'start' || action === 'stop') {
      // Update signal generator status
      const { error } = await supabase
        .from('system_config')
        .upsert({
          config_key: 'SIGNAL_GENERATOR_ACTIVE',
          config_value: action === 'start' ? 'true' : 'false',
          config_type: 'boolean',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating signal generator status:', error)
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Signal generator ${action}ed successfully`,
        status: action === 'start' ? 'running' : 'stopped',
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'update-config' && config) {
      // Update signal generator configuration
      const configUpdates = [
        {
          config_key: 'MIN_CONFIDENCE_THRESHOLD',
          config_value: String(config.minConfidence || 75),
          config_type: 'number'
        },
        {
          config_key: 'CVD_FILTER_ENABLED',
          config_value: String(config.enableCVDFilter !== false),
          config_type: 'boolean'
        },
        {
          config_key: 'CVD_THRESHOLD',
          config_value: String(config.cvdThreshold || 0.5),
          config_type: 'number'
        },
        {
          config_key: 'AUTO_SEND_ENABLED',
          config_value: String(config.autoSendEnabled !== false),
          config_type: 'boolean'
        }
      ].map(item => ({
        ...item,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('system_config')
        .upsert(configUpdates)

      if (error) {
        console.error('Error updating signal generator config:', error)
        return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Signal generator configuration updated successfully',
        config: config,
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'test-signal') {
      // Generate a signal from the provided data or use defaults
      const signalData: TradingSignal = {
        symbol: body.symbol || 'ES',
        direction: body.signal?.direction || 'LONG',
        entry_price: parseFloat(body.signal?.entry || '4450.50'),
        stop_loss: parseFloat(body.signal?.stop_loss || '4440.00'),
        target_price_1: body.signal?.target1 ? parseFloat(body.signal.target1) : 4465.00,
        target_price_2: body.signal?.target2 ? parseFloat(body.signal.target2) : undefined,
        target_price_3: body.signal?.target3 ? parseFloat(body.signal.target3) : undefined,
        confidence_level: body.signal?.confidence || 85,
        strategy: body.signal?.strategy || 'Admin Manual Signal',
        timeframe: body.signal?.timeframe || '15m',
        notes: body.signal?.notes || undefined
      }

      console.log('🚀 Generating signal:', signalData);

      // Use the signal delivery service
      const deliveryResult = await deliverSignal(signalData, {
        sendToDiscord: body.signal?.sendToDiscord !== false,
        saveToDatabase: true,
        executeOnIBGateway: body.signal?.executeOnSim !== false,
        positionSize: body.signal?.positionSize || 1,
        sendEmail: false
      });

      if (deliveryResult.success) {
        return NextResponse.json({
          success: true,
          message: 'Signal generated and delivered successfully',
          signalId: deliveryResult.signalId,
          signal: signalData,
          discord: deliveryResult.discord?.sent ? 'Sent to Discord' : 'Discord delivery failed',
          database: deliveryResult.database?.saved ? 'Saved to database' : 'Database save failed',
          ibGateway: deliveryResult.ibGateway?.executed 
            ? `Executed on IB Gateway (Order #${deliveryResult.ibGateway.orderId})` 
            : deliveryResult.ibGateway?.error || 'IB Gateway execution skipped',
          timestamp: new Date().toISOString()
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'Signal generation completed with errors',
          signalId: deliveryResult.signalId,
          errors: {
            discord: deliveryResult.discord?.error,
            database: deliveryResult.database?.error,
            ibGateway: deliveryResult.ibGateway?.error
          },
          timestamp: new Date().toISOString()
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/signal-generator:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication using cookies (same as admin dashboard)
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const isValid = await FallbackAuth.verifyToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      minConfidence = 75,
      enableCVDFilter = true,
      cvdThreshold = 0.5,
      autoSendEnabled = true
    } = body

    // Update all configuration values
    const configUpdates = [
      {
        config_key: 'MIN_CONFIDENCE_THRESHOLD',
        config_value: String(minConfidence),
        config_type: 'number'
      },
      {
        config_key: 'CVD_FILTER_ENABLED',
        config_value: String(enableCVDFilter),
        config_type: 'boolean'
      },
      {
        config_key: 'CVD_THRESHOLD',
        config_value: String(cvdThreshold),
        config_type: 'number'
      },
      {
        config_key: 'AUTO_SEND_ENABLED',
        config_value: String(autoSendEnabled),
        config_type: 'boolean'
      }
    ].map(item => ({
      ...item,
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('system_config')
      .upsert(configUpdates)

    if (error) {
      console.error('Error updating signal generator settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Signal generator settings updated successfully',
      settings: {
        minConfidence,
        enableCVDFilter,
        cvdThreshold,
        autoSendEnabled
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/signal-generator:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
