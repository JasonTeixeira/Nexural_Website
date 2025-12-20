import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Asset configuration for different trading instruments
const ASSET_CONFIG = {
  // Futures
  "ES": { 
    name: "E-mini S&P 500", 
    pointValue: 50, 
    minMove: 0.25, 
    riskPoints: 20,
    category: "futures",
    color: 0xFF4444 // Red for Monday
  },
  "NQ": { 
    name: "E-mini NASDAQ", 
    pointValue: 20, 
    minMove: 0.25, 
    riskPoints: 30,
    category: "futures",
    color: 0xFF8800 // Orange for Tuesday
  },
  "YM": { 
    name: "E-mini Dow", 
    pointValue: 5, 
    minMove: 1, 
    riskPoints: 100,
    category: "futures",
    color: 0xFFDD00 // Yellow for Wednesday
  },
  "RTY": { 
    name: "E-mini Russell", 
    pointValue: 50, 
    minMove: 0.1, 
    riskPoints: 15,
    category: "futures",
    color: 0x44FF44 // Green for Thursday
  },
  "CL": { 
    name: "Crude Oil", 
    pointValue: 1000, 
    minMove: 0.01, 
    riskPoints: 0.50,
    category: "commodities",
    color: 0x4488FF // Blue for Friday
  },
  "GC": { 
    name: "Gold", 
    pointValue: 100, 
    minMove: 0.1, 
    riskPoints: 10,
    category: "commodities",
    color: 0xFF4444
  },
  // Crypto
  "BTC": { 
    name: "Bitcoin", 
    pointValue: 1, 
    minMove: 0.01, 
    riskPoints: 500,
    category: "crypto",
    color: 0xFF8800
  },
  "ETH": { 
    name: "Ethereum", 
    pointValue: 1, 
    minMove: 0.01, 
    riskPoints: 50,
    category: "crypto",
    color: 0xFFDD00
  }
}

// Day of week colors
const DAY_COLORS = [
  0xFF4444, // Sunday - Red
  0xFF4444, // Monday - Red  
  0xFF8800, // Tuesday - Orange
  0xFFDD00, // Wednesday - Yellow
  0x44FF44, // Thursday - Green
  0x4488FF, // Friday - Blue
  0xFF4444  // Saturday - Red
]

interface TradingSignal {
  symbol: string
  direction: 'LONG' | 'SHORT'
  strategy: string
  confidence: number
  entry: number
  stop_loss: number
  targets: number[]
  risk_points: number
  timeframe: string
  timestamp?: string
  // CVD and filtering fields
  cvd?: number
  cvd_divergence?: boolean
  volume_profile?: number
  // ACE Squeeze Pro specific fields
  momentum?: number
  squeeze_status?: string
  signal_quality?: number
  cycle_phase?: string
  market_regime?: string
  alignment?: number
}

// Default filter settings (can be overridden by admin settings)
const DEFAULT_FILTER_SETTINGS = {
  minConfidence: 75,
  enableCVDFilter: true,
  cvdThreshold: 0.5,
  autoSendEnabled: true
}

// Automatic signal filtering function
function applySignalFilters(signal: TradingSignal, filterSettings: any) {
  // If auto-send is disabled, reject all signals
  if (!filterSettings.autoSendEnabled) {
    return {
      passed: false,
      reason: 'Auto-send is disabled'
    }
  }

  // Confidence filter
  if (signal.confidence < filterSettings.minConfidence) {
    return {
      passed: false,
      reason: `Confidence ${signal.confidence}% below minimum ${filterSettings.minConfidence}%`
    }
  }

  // CVD filter (if enabled and CVD data is available)
  if (filterSettings.enableCVDFilter && signal.cvd !== undefined) {
    if (Math.abs(signal.cvd) < filterSettings.cvdThreshold) {
      return {
        passed: false,
        reason: `CVD ${signal.cvd} below threshold ${filterSettings.cvdThreshold}`
      }
    }
  }

  // All filters passed
  return {
    passed: true,
    reason: 'All filters passed'
  }
}

export async function POST(req: NextRequest) {
  try {
    // Security check
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET
    
    if (!expectedSecret || !authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    console.log('Enhanced TradingView webhook received:', payload)

    // Parse the signal data
    const signal: TradingSignal = {
      symbol: payload.symbol?.toUpperCase(),
      direction: payload.direction?.toUpperCase(),
      strategy: payload.strategy || 'Q Engine',
      confidence: payload.confidence || 85,
      entry: parseFloat(payload.entry),
      stop_loss: parseFloat(payload.stop_loss),
      targets: payload.targets?.map((t: any) => parseFloat(t)) || [],
      risk_points: parseFloat(payload.risk_points) || 0,
      timeframe: payload.timeframe || '15m',
      timestamp: payload.timestamp || new Date().toISOString(),
      // CVD and filtering data
      cvd: payload.cvd ? parseFloat(payload.cvd) : undefined,
      cvd_divergence: payload.cvd_divergence || false,
      volume_profile: payload.volume_profile ? parseFloat(payload.volume_profile) : undefined
    }

    // Validate required fields
    if (!signal.symbol || !signal.direction || !signal.entry) {
      return NextResponse.json({ 
        error: 'Missing required fields: symbol, direction, entry' 
      }, { status: 400 })
    }

    // Check if we support this asset
    const assetConfig = ASSET_CONFIG[signal.symbol as keyof typeof ASSET_CONFIG]
    if (!assetConfig) {
      return NextResponse.json({ 
        error: `Unsupported symbol: ${signal.symbol}` 
      }, { status: 400 })
    }

    // AUTOMATIC SIGNAL FILTERING
    const filterResult = applySignalFilters(signal, DEFAULT_FILTER_SETTINGS)
    if (!filterResult.passed) {
      console.log(`Signal filtered out: ${signal.symbol} ${signal.direction} - ${filterResult.reason}`)
      return NextResponse.json({
        success: false,
        filtered: true,
        reason: filterResult.reason,
        signal: {
          symbol: signal.symbol,
          direction: signal.direction,
          confidence: signal.confidence
        }
      })
    }

    // Calculate risk metrics
    const riskCalculation = calculateRiskMetrics(signal, assetConfig)
    
    // Store signal in database for performance tracking
    const { data: storedSignal, error: dbError } = await supabase
      .from('trading_signals')
      .insert([
        {
          symbol: signal.symbol,
          direction: signal.direction,
          entry_price: signal.entry,
          stop_loss: signal.stop_loss,
          targets: signal.targets,
          confidence: signal.confidence,
          strategy: signal.strategy,
          timeframe: signal.timeframe,
          created_by: 'tradingview_webhook'
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Error storing signal in database:', dbError)
      // Continue with Discord send even if database fails
    } else {
      console.log(`Signal stored in database with ID: ${storedSignal?.id}`)
    }
    
    // Create professional Discord embed
    const embed = createProfessionalSignalEmbed(signal, assetConfig, riskCalculation)

    // Send to Discord using webhook
    const webhookUrl = getWebhookForAsset(signal.symbol)
    const webhookSent = await sendDiscordWebhook(webhookUrl, embed)
    
    if (!webhookSent) {
      console.error(`Failed to send Discord webhook for ${signal.symbol}`)
    }

    console.log(`Trading signal sent: ${signal.symbol} ${signal.direction}`)

    return NextResponse.json({
      success: true,
      signal: {
        symbol: signal.symbol,
        direction: signal.direction,
        entry: signal.entry,
        confidence: signal.confidence,
        risk_reward: riskCalculation.riskReward
      }
    })

  } catch (error) {
    console.error('Enhanced webhook error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Webhook processing failed'
    }, { status: 500 })
  }
}

function calculateRiskMetrics(signal: TradingSignal, assetConfig: any) {
  const { entry, stop_loss, targets } = signal
  const { pointValue } = assetConfig

  // Calculate risk per contract
  const riskPerContract = Math.abs(entry - stop_loss) * pointValue
  const riskPoints = Math.abs(entry - stop_loss)
  
  // Calculate profit targets with detailed risk management
  const profitTargets = targets.map((target, index) => ({
    price: target,
    profit: Math.abs(target - entry) * pointValue,
    rMultiple: Math.abs(target - entry) / Math.abs(entry - stop_loss),
    profitPoints: Math.abs(target - entry),
    targetNumber: index + 1
  }))

  // Calculate breakeven point (50% to first target)
  const firstTarget = targets[0]
  const breakevenDistance = firstTarget ? Math.abs(firstTarget - entry) * 0.5 : Math.abs(entry - stop_loss) * 0.5
  const breakeven = signal.direction === 'LONG' 
    ? entry + breakevenDistance 
    : entry - breakevenDistance

  // Calculate overall risk/reward
  const avgTarget = targets.reduce((sum, target) => sum + target, 0) / targets.length
  const riskReward = Math.abs(avgTarget - entry) / Math.abs(entry - stop_loss)

  return {
    riskPerContract,
    riskPoints,
    profitTargets,
    riskReward: Math.round(riskReward * 100) / 100,
    breakeven,
    breakevenDistance: Math.round(breakevenDistance * 100) / 100
  }
}

function createProfessionalSignalEmbed(signal: TradingSignal, assetConfig: any, riskCalc: any) {
  const now = new Date()
  const dayColor = DAY_COLORS[now.getDay()]
  
  // Format the signal type emoji
  const signalEmoji = signal.direction === 'LONG' ? '🎯' : '🔻'
  
  // Create detailed profit target breakdown
  const targetBreakdown = signal.targets.map((target, i) => {
    const rMultiple = riskCalc.profitTargets[i]?.rMultiple.toFixed(1) || '0.0'
    const profit = riskCalc.profitTargets[i]?.profit.toFixed(0) || '0'
    return `**T${i+1} (${rMultiple}R):** $${target.toFixed(2)} → $${profit} profit`
  }).join('\n')

  // Create risk management plan
  const riskManagementPlan = [
    `🔴 **STOP LOSS:** $${signal.stop_loss.toFixed(2)} (${riskCalc.riskPoints.toFixed(2)} pts)`,
    `🟡 **BREAKEVEN:** $${riskCalc.breakeven.toFixed(2)} (Move stop to BE at 50% to T1)`,
    `🟢 **TARGET 1:** $${signal.targets[0]?.toFixed(2) || 'N/A'} (Take 1/3 position)`,
    signal.targets[1] ? `🟢 **TARGET 2:** $${signal.targets[1].toFixed(2)} (Take 1/2 remaining)` : '',
    signal.targets[2] ? `🟢 **TARGET 3:** $${signal.targets[2].toFixed(2)} (Take final position)` : ''
  ].filter(Boolean).join('\n')
  
  return {
    embeds: [{
      color: dayColor,
      title: `${signalEmoji} ${signal.direction} SIGNAL - ${signal.symbol}/${signal.symbol === 'ES' ? 'MES' : 'M' + signal.symbol}`,
      description: `**Strategy:** ${signal.strategy} | **🎯 CONFIDENCE: ${signal.confidence}%** | **Risk/Reward:** ${riskCalc.riskReward}R${signal.cvd ? ` | **CVD:** ${signal.cvd}` : ''}`,
      fields: [
        {
          name: "📊 Entry Details",
          value: `**Entry:** $${signal.entry.toFixed(2)}\n**Direction:** ${signal.direction}\n**Time:** ${now.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} EST`,
          inline: true
        },
        {
          name: "🛡️ Risk Per Contract", 
          value: `**Stop Loss:** $${signal.stop_loss.toFixed(2)}\n**Risk Points:** ${riskCalc.riskPoints.toFixed(2)}\n**$ Risk:** $${riskCalc.riskPerContract.toFixed(0)}`,
          inline: true
        },
        {
          name: "🎯 Profit Targets",
          value: targetBreakdown,
          inline: true
        },
        {
          name: "📈 Risk Management Plan",
          value: riskManagementPlan,
          inline: false
        },
        {
          name: `💰 Standard ${signal.symbol} Contract`,
          value: `**Point Value:** $${assetConfig.pointValue}\n**Max Risk:** $${riskCalc.riskPerContract.toFixed(0)}\n**T1 Profit:** $${riskCalc.profitTargets[0]?.profit.toFixed(0) || 'N/A'}`,
          inline: true
        },
        {
          name: `⚡ Micro M${signal.symbol} Contract`,
          value: `**Point Value:** $${(assetConfig.pointValue / 10).toFixed(1)}\n**Max Risk:** $${(riskCalc.riskPerContract / 10).toFixed(0)}\n**T1 Profit:** $${(riskCalc.profitTargets[0]?.profit / 10).toFixed(0) || 'N/A'}`,
          inline: true
        },
        {
          name: "🎯 Position Management",
          value: `**Breakeven:** $${riskCalc.breakeven.toFixed(2)}\n**Scale Out:** 1/3 at each target\n**Trail Stop:** After T1 hit`,
          inline: true
        }
      ],
      footer: {
        text: `Nexural Trading • ${signal.strategy} • Risk Management Protocol • ${now.toLocaleDateString('en-US', { weekday: 'long' })}`,
        icon_url: "https://your-domain.com/logo.png"
      },
      timestamp: signal.timestamp
    }]
  }
}


function getWebhookForAsset(symbol: string): string {
  // Map symbols to Discord webhook URLs
  const webhookMap: Record<string, string> = {
    'ES': process.env.DISCORD_WEBHOOK_ES!,
    'NQ': process.env.DISCORD_WEBHOOK_NQ!,
    'YM': process.env.DISCORD_WEBHOOK_YM!,
    'RTY': process.env.DISCORD_WEBHOOK_RTY!,
    'CL': process.env.DISCORD_WEBHOOK_CL!,
    'GC': process.env.DISCORD_WEBHOOK_GC!,
    'SI': process.env.DISCORD_WEBHOOK_SI!,
    'BTC': process.env.DISCORD_WEBHOOK_BTC!,
    'ETH': process.env.DISCORD_WEBHOOK_ETH!
  }
  
  return webhookMap[symbol] || webhookMap['ES']
}

// Function to send webhook to Discord
async function sendDiscordWebhook(webhookUrl: string, embed: any): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(embed)
    })

    if (response.ok) {
      console.log(`Discord webhook sent successfully to ${webhookUrl}`)
      return true
    } else {
      console.error(`Discord webhook failed: ${response.status} ${response.statusText}`)
      return false
    }
  } catch (error) {
    console.error('Discord webhook error:', error)
    return false
  }
}

// GET endpoint for webhook info
export async function GET() {
  return NextResponse.json({
    message: 'Enhanced TradingView Webhook Endpoint',
    endpoint: '/api/webhooks/tradingview-enhanced',
    method: 'POST',
    authentication: 'Bearer token required',
    supportedAssets: Object.keys(ASSET_CONFIG),
    requiredFields: ['symbol', 'direction', 'entry'],
    optionalFields: [
      'strategy', 'confidence', 'stop_loss', 'targets', 
      'risk_points', 'timeframe', 'timestamp'
    ],
    example: {
      symbol: 'ES',
      direction: 'LONG',
      strategy: 'ML_Momentum',
      confidence: 87.5,
      entry: 4500.00,
      stop_loss: 4464.00,
      targets: [4536.00, 4572.00, 4608.00],
      risk_points: 36.00,
      timeframe: '15m',
      timestamp: '2024-12-22T12:29:35Z'
    }
  })
}
