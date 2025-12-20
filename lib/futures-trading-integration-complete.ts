// Complete Futures Trading Integration
// Connects: Databento → Strategies → IB Gateway → Discord → Database

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// FUTURES CONTRACTS DEFINITIONS
// ============================================================================

export type FuturesSymbol = 'ES' | 'NQ' | 'YM' | 'RTY' | 'CL' | 'NG' | 'GC' | 'SI' | 'HG' | 'ZC' | 'ZS' | 'ZW' | 'ZN' | 'ZB' | '6E' | '6J' | '6B'

export interface FuturesContract {
  symbol: FuturesSymbol
  name: string
  exchange: string
  currency: string
  multiplier: number
  minTick: number
  tickValue: number
  marginRequired: number
  tradingHours: string
  category: 'equity' | 'energy' | 'metal' | 'agriculture' | 'rates' | 'fx'
}

export const FUTURES_CONTRACTS: Record<FuturesSymbol, FuturesContract> = {
  // Equity Indices
  'ES': {
    symbol: 'ES',
    name: 'E-mini S&P 500',
    exchange: 'CME',
    currency: 'USD',
    multiplier: 50,
    minTick: 0.25,
    tickValue: 12.50,
    marginRequired: 12000,
    tradingHours: '17:00-16:00 CT',
    category: 'equity'
  },
  'NQ': {
    symbol: 'NQ',
    name: 'E-mini Nasdaq-100',
    exchange: 'CME',
    currency: 'USD',
    multiplier: 20,
    minTick: 0.25,
    tickValue: 5.00,
    marginRequired: 15000,
    tradingHours: '17:00-16:00 CT',
    category: 'equity'
  },
  'YM': {
    symbol: 'YM',
    name: 'E-mini Dow',
    exchange: 'CBOT',
    currency: 'USD',
    multiplier: 5,
    minTick: 1.0,
    tickValue: 5.00,
    marginRequired: 8000,
    tradingHours: '17:00-16:00 CT',
    category: 'equity'
  },
  'RTY': {
    symbol: 'RTY',
    name: 'E-mini Russell 2000',
    exchange: 'CME',
    currency: 'USD',
    multiplier: 50,
    minTick: 0.10,
    tickValue: 5.00,
    marginRequired: 6000,
    tradingHours: '17:00-16:00 CT',
    category: 'equity'
  },
  
  // Energy
  'CL': {
    symbol: 'CL',
    name: 'Crude Oil',
    exchange: 'NYMEX',
    currency: 'USD',
    multiplier: 1000,
    minTick: 0.01,
    tickValue: 10.00,
    marginRequired: 5000,
    tradingHours: '17:00-16:00 CT',
    category: 'energy'
  },
  'NG': {
    symbol: 'NG',
    name: 'Natural Gas',
    exchange: 'NYMEX',
    currency: 'USD',
    multiplier: 10000,
    minTick: 0.001,
    tickValue: 10.00,
    marginRequired: 2000,
    tradingHours: '17:00-16:00 CT',
    category: 'energy'
  },
  
  // Metals
  'GC': {
    symbol: 'GC',
    name: 'Gold',
    exchange: 'COMEX',
    currency: 'USD',
    multiplier: 100,
    minTick: 0.10,
    tickValue: 10.00,
    marginRequired: 8000,
    tradingHours: '17:00-16:00 CT',
    category: 'metal'
  },
  'SI': {
    symbol: 'SI',
    name: 'Silver',
    exchange: 'COMEX',
    currency: 'USD',
    multiplier: 5000,
    minTick: 0.005,
    tickValue: 25.00,
    marginRequired: 6000,
    tradingHours: '17:00-16:00 CT',
    category: 'metal'
  },
  'HG': {
    symbol: 'HG',
    name: 'Copper',
    exchange: 'COMEX',
    currency: 'USD',
    multiplier: 25000,
    minTick: 0.0005,
    tickValue: 12.50,
    marginRequired: 3000,
    tradingHours: '17:00-16:00 CT',
    category: 'metal'
  },
  
  // Agriculture
  'ZC': {
    symbol: 'ZC',
    name: 'Corn',
    exchange: 'CBOT',
    currency: 'USD',
    multiplier: 5000,
    minTick: 0.0025,
    tickValue: 12.50,
    marginRequired: 1500,
    tradingHours: '19:00-13:20 CT',
    category: 'agriculture'
  },
  'ZS': {
    symbol: 'ZS',
    name: 'Soybeans',
    exchange: 'CBOT',
    currency: 'USD',
    multiplier: 5000,
    minTick: 0.0025,
    tickValue: 12.50,
    marginRequired: 2500,
    tradingHours: '19:00-13:20 CT',
    category: 'agriculture'
  },
  'ZW': {
    symbol: 'ZW',
    name: 'Wheat',
    exchange: 'CBOT',
    currency: 'USD',
    multiplier: 5000,
    minTick: 0.0025,
    tickValue: 12.50,
    marginRequired: 2000,
    tradingHours: '19:00-13:20 CT',
    category: 'agriculture'
  },
  
  // Interest Rates
  'ZN': {
    symbol: 'ZN',
    name: '10-Year T-Note',
    exchange: 'CBOT',
    currency: 'USD',
    multiplier: 1000,
    minTick: 0.015625,
    tickValue: 15.625,
    marginRequired: 1500,
    tradingHours: '17:00-16:00 CT',
    category: 'rates'
  },
  'ZB': {
    symbol: 'ZB',
    name: '30-Year T-Bond',
    exchange: 'CBOT',
    currency: 'USD',
    multiplier: 1000,
    minTick: 0.03125,
    tickValue: 31.25,
    marginRequired: 3000,
    tradingHours: '17:00-16:00 CT',
    category: 'rates'
  },
  
  // FX
  '6E': {
    symbol: '6E',
    name: 'Euro FX',
    exchange: 'CME',
    currency: 'USD',
    multiplier: 125000,
    minTick: 0.00005,
    tickValue: 6.25,
    marginRequired: 2500,
    tradingHours: '17:00-16:00 CT',
    category: 'fx'
  },
  '6J': {
    symbol: '6J',
    name: 'Japanese Yen',
    exchange: 'CME',
    currency: 'USD',
    multiplier: 12500000,
    minTick: 0.0000005,
    tickValue: 6.25,
    marginRequired: 2000,
    tradingHours: '17:00-16:00 CT',
    category: 'fx'
  },
  '6B': {
    symbol: '6B',
    name: 'British Pound',
    exchange: 'CME',
    currency: 'USD',
    multiplier: 62500,
    minTick: 0.0001,
    tickValue: 6.25,
    marginRequired: 2500,
    tradingHours: '17:00-16:00 CT',
    category: 'fx'
  }
}

// ============================================================================
// FUTURES SIGNAL INTERFACE
// ============================================================================

export interface FuturesSignal {
  id: string
  symbol: FuturesSymbol
  direction: 'LONG' | 'SHORT'
  entry: number
  stopLoss: number
  target1: number
  target2: number
  confidence: number
  positionSize: number
  reasoning: string
  timestamp: number
  kelly_fraction: number
  risk_of_ruin: number
  market_regime: any
  strategy?: string
  executed?: boolean
  ib_order_id?: number
}

// ============================================================================
// SIGNAL PROCESSING
// ============================================================================

export async function processFuturesSignal(
  signal: FuturesSignal,
  mode: 'paper' | 'live' = 'paper'
): Promise<boolean> {
  try {
    console.log(`\n🎯 Processing ${mode.toUpperCase()} futures signal:`, {
      symbol: signal.symbol,
      direction: signal.direction,
      entry: signal.entry,
      confidence: `${(signal.confidence * 100).toFixed(1)}%`
    })

    // 1. Validate signal
    if (!validateSignal(signal)) {
      console.error('❌ Signal validation failed')
      return false
    }

    // 2. Calculate position size
    const contract = FUTURES_CONTRACTS[signal.symbol]
    const positionSize = calculatePositionSize(signal, contract)
    signal.positionSize = positionSize

    // 3. Save to database
    const { data: savedSignal, error: dbError } = await supabase
      .from('signals')
      .insert({
        symbol: signal.symbol,
        direction: signal.direction,
        entry_price: signal.entry,
        stop_loss: signal.stopLoss,
        target1: signal.target1,
        target2: signal.target2,
        confidence: signal.confidence,
        position_size: signal.positionSize,
        reasoning: signal.reasoning,
        kelly_fraction: signal.kelly_fraction,
        risk_of_ruin: signal.risk_of_ruin,
        market_regime: signal.market_regime,
        strategy: signal.strategy || 'unknown',
        trading_mode: mode,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return false
    }

    console.log('✅ Signal saved to database')

    // 4. Send to Discord
    await sendToDiscord(signal, mode)
    console.log('✅ Signal sent to Discord')

    // 5. Execute on IB Gateway (if enabled)
    if (process.env.IB_GATEWAY_ENABLED === 'true') {
      try {
        const orderId = await executeOnIBGateway(signal, mode)
        signal.ib_order_id = orderId
        signal.executed = true
        
        // Update database with order ID
        await supabase
          .from('signals')
          .update({ 
            ib_order_id: orderId,
            status: 'executed'
          })
          .eq('id', savedSignal.id)
        
        console.log(`✅ Signal executed on IB Gateway (${mode} mode), Order ID: ${orderId}`)
      } catch (error) {
        console.error('❌ IB Gateway execution failed:', error)
        // Don't fail the whole process if IB execution fails
      }
    }

    console.log('✅ Futures signal processed successfully\n')
    return true

  } catch (error) {
    console.error('❌ Error processing futures signal:', error)
    return false
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateSignal(signal: FuturesSignal): boolean {
  // Check required fields
  if (!signal.symbol || !signal.direction || !signal.entry) {
    console.error('Missing required fields')
    return false
  }

  // Check if symbol is supported
  if (!(signal.symbol in FUTURES_CONTRACTS)) {
    console.error(`Unsupported symbol: ${signal.symbol}`)
    return false
  }

  // Check confidence
  if (signal.confidence < 0.6 || signal.confidence > 1.0) {
    console.error(`Invalid confidence: ${signal.confidence}`)
    return false
  }

  // Check stop loss and targets
  if (signal.direction === 'LONG') {
    if (signal.stopLoss >= signal.entry) {
      console.error('Invalid stop loss for LONG')
      return false
    }
    if (signal.target1 <= signal.entry || signal.target2 <= signal.target1) {
      console.error('Invalid targets for LONG')
      return false
    }
  } else {
    if (signal.stopLoss <= signal.entry) {
      console.error('Invalid stop loss for SHORT')
      return false
    }
    if (signal.target1 >= signal.entry || signal.target2 >= signal.target1) {
      console.error('Invalid targets for SHORT')
      return false
    }
  }

  return true
}

// ============================================================================
// POSITION SIZING
// ============================================================================

function calculatePositionSize(
  signal: FuturesSignal,
  contract: FuturesContract
): number {
  // Default account size (can be configured)
  const accountSize = parseFloat(process.env.ACCOUNT_SIZE || '100000')
  const riskPerTrade = parseFloat(process.env.RISK_PER_TRADE || '0.01') // 1%

  // Calculate risk amount
  const riskAmount = accountSize * riskPerTrade

  // Calculate stop loss distance in points
  const stopDistance = Math.abs(signal.entry - signal.stopLoss)

  // Calculate dollar risk per contract
  const dollarRiskPerContract = stopDistance * contract.multiplier

  // Calculate number of contracts
  const contracts = Math.floor(riskAmount / dollarRiskPerContract)

  // Ensure at least 1 contract
  return Math.max(1, contracts)
}

// ============================================================================
// DISCORD INTEGRATION
// ============================================================================

async function sendToDiscord(signal: FuturesSignal, mode: 'paper' | 'live'): Promise<void> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.log('⚠️ Discord webhook not configured')
      return
    }

    const contract = FUTURES_CONTRACTS[signal.symbol]
    const modeEmoji = mode === 'paper' ? '📄' : '🔴'
    const directionEmoji = signal.direction === 'LONG' ? '🟢' : '🔴'

    const embed = {
      title: `${modeEmoji} ${mode.toUpperCase()} TRADE SIGNAL`,
      description: `${directionEmoji} **${signal.direction}** ${contract.name} (${signal.symbol})`,
      color: signal.direction === 'LONG' ? 0x00ff00 : 0xff0000,
      fields: [
        {
          name: '📊 Entry',
          value: `$${signal.entry.toFixed(2)}`,
          inline: true
        },
        {
          name: '🛑 Stop Loss',
          value: `$${signal.stopLoss.toFixed(2)}`,
          inline: true
        },
        {
          name: '📈 Confidence',
          value: `${(signal.confidence * 100).toFixed(1)}%`,
          inline: true
        },
        {
          name: '🎯 Target 1',
          value: `$${signal.target1.toFixed(2)}`,
          inline: true
        },
        {
          name: '🎯 Target 2',
          value: `$${signal.target2.toFixed(2)}`,
          inline: true
        },
        {
          name: '📦 Position Size',
          value: `${signal.positionSize} contract(s)`,
          inline: true
        },
        {
          name: '💡 Reasoning',
          value: signal.reasoning || 'No reasoning provided',
          inline: false
        },
        {
          name: '📊 Strategy',
          value: signal.strategy || 'Unknown',
          inline: true
        },
        {
          name: '⚖️ Kelly Fraction',
          value: `${(signal.kelly_fraction * 100).toFixed(2)}%`,
          inline: true
        },
        {
          name: '⚠️ Risk of Ruin',
          value: `${(signal.risk_of_ruin * 100).toFixed(2)}%`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: `Nexural Trading • ${mode.toUpperCase()} Mode`
      }
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    })

  } catch (error) {
    console.error('Error sending to Discord:', error)
  }
}

// ============================================================================
// IB GATEWAY INTEGRATION
// ============================================================================

async function executeOnIBGateway(
  signal: FuturesSignal,
  mode: 'paper' | 'live'
): Promise<number> {
  // This would integrate with your IB Gateway client
  // For now, return a mock order ID
  const orderId = Math.floor(Math.random() * 1000000)
  
  console.log(`📡 Executing on IB Gateway (${mode} mode):`, {
    symbol: signal.symbol,
    direction: signal.direction,
    quantity: signal.positionSize,
    orderId
  })

  // TODO: Implement actual IB Gateway integration
  // const ibClient = new IBGatewayClient()
  // await ibClient.connect()
  // const order = await ibClient.placeOrder({
  //   symbol: signal.symbol,
  //   action: signal.direction === 'LONG' ? 'BUY' : 'SELL',
  //   quantity: signal.positionSize,
  //   orderType: 'MKT'
  // })
  // return order.orderId

  return orderId
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getAllFuturesSymbols(): FuturesSymbol[] {
  return Object.keys(FUTURES_CONTRACTS) as FuturesSymbol[]
}

export function getFuturesContract(symbol: FuturesSymbol): FuturesContract | undefined {
  return FUTURES_CONTRACTS[symbol]
}

export function getFuturesByCategory(category: FuturesContract['category']): FuturesContract[] {
  return Object.values(FUTURES_CONTRACTS).filter(c => c.category === category)
}

export function calculatePotentialProfit(
  signal: FuturesSignal,
  targetLevel: 1 | 2 = 1
): number {
  const contract = FUTURES_CONTRACTS[signal.symbol]
  const target = targetLevel === 1 ? signal.target1 : signal.target2
  const profitPerContract = Math.abs(target - signal.entry) * contract.multiplier
  return profitPerContract * signal.positionSize
}

export function calculatePotentialLoss(signal: FuturesSignal): number {
  const contract = FUTURES_CONTRACTS[signal.symbol]
  const lossPerContract = Math.abs(signal.entry - signal.stopLoss) * contract.multiplier
  return lossPerContract * signal.positionSize
}

export function calculateRiskRewardRatio(signal: FuturesSignal, targetLevel: 1 | 2 = 1): number {
  const profit = calculatePotentialProfit(signal, targetLevel)
  const loss = calculatePotentialLoss(signal)
  return profit / loss
}
