// Professional Signal Formatter - Institutional Grade
// Real-time position management with follow-through signals

import { SYMBOL_METADATA } from './discord-webhooks-18-symbols'

export interface ProfessionalSignal {
  // Core Signal Data
  symbol: string
  direction: 'LONG' | 'SHORT'
  entry: number
  confidence: number
  strategy: string
  time: string
  
  // Risk Management
  stopLoss: number
  breakeven: number
  target1: number
  target2: number
  target3?: number
  
  // Position Management
  riskPerContract: number
  maxRisk: number
  positionSize: number
  
  // Contract Details
  pointValue: number
  microPointValue?: number
  
  // Follow-through tracking
  signalId: string
  signalType: 'ENTRY' | 'BREAKEVEN' | 'TARGET_HIT' | 'STOP_OUT' | 'MANAGEMENT'
  parentSignalId?: string
}

export function formatProfessionalSignal(signal: ProfessionalSignal) {
  const metadata = SYMBOL_METADATA[signal.symbol as keyof typeof SYMBOL_METADATA]
  
  if (!metadata) {
    throw new Error(`No metadata found for symbol: ${signal.symbol}`)
  }

  // Calculate profit targets in dollars
  const calculateProfit = (target: number, entry: number, pointValue: number) => {
    return Math.abs(target - entry) * pointValue
  }

  const t1Profit = calculateProfit(signal.target1, signal.entry, signal.pointValue)
  const t2Profit = calculateProfit(signal.target2, signal.entry, signal.pointValue)
  const maxRiskDollar = Math.abs(signal.stopLoss - signal.entry) * signal.pointValue

  // Micro contract calculations
  const microProfit1 = signal.microPointValue ? calculateProfit(signal.target1, signal.entry, signal.microPointValue) : null
  const microMaxRisk = signal.microPointValue ? Math.abs(signal.stopLoss - signal.entry) * signal.microPointValue : null

  // Risk/Reward ratio
  const riskRewardRatio = (t1Profit / maxRiskDollar).toFixed(1)

  // Build contract info
  let contractInfo = ''
  if ('micro' in metadata && metadata.micro) {
    contractInfo = `/${metadata.micro}`
  }

  return {
    embeds: [{
      title: `${metadata.emoji} ${signal.direction} SIGNAL - ${signal.symbol}${contractInfo}`,
      description: `**Strategy:** ${signal.strategy} | ${metadata.emoji} **CONFIDENCE:** ${signal.confidence}% | **Risk/Reward:** ${riskRewardRatio}R`,
      color: signal.direction === 'LONG' ? 0x00ff00 : 0xff0000,
      fields: [
        {
          name: '📊 Entry Details',
          value: `**Entry:** $${signal.entry.toFixed(2)}\n**Direction:** ${signal.direction}\n**Time:** ${signal.time}`,
          inline: true
        },
        {
          name: '🛡️ Risk Per Contract',
          value: `**Stop Loss:** $${signal.stopLoss.toFixed(2)}\n**Risk Points:** ${Math.abs(signal.stopLoss - signal.entry).toFixed(2)}\n**$ Risk:** $${maxRiskDollar.toFixed(0)}`,
          inline: true
        },
        {
          name: `${metadata.emoji} Profit Targets`,
          value: `**T1 (1.0R):** $${signal.target1.toFixed(2)} → $${t1Profit.toFixed(0)} profit\n**T2 (2.0R):** $${signal.target2.toFixed(2)} → $${t2Profit.toFixed(0)} profit${signal.target3 ? `\n**T3:** $${signal.target3.toFixed(2)}` : ''}`,
          inline: false
        },
        {
          name: '📈 Risk Management Plan',
          value: `🔴 **STOP LOSS:** $${signal.stopLoss.toFixed(2)} (${Math.abs(signal.stopLoss - signal.entry).toFixed(2)} pts)\n🟡 **BREAKEVEN:** $${signal.breakeven.toFixed(2)} (Move stop to BE at 50% to T1)\n🟢 **TARGET 1:** $${signal.target1.toFixed(2)} (Take 1/3 position)\n🟢 **TARGET 2:** $${signal.target2.toFixed(2)} (Take 1/2 remaining)`,
          inline: false
        },
        {
          name: '💰 Standard Contract',
          value: `**Point Value:** $${signal.pointValue}\n**Max Risk:** $${maxRiskDollar.toFixed(0)}\n**T1 Profit:** $${t1Profit.toFixed(0)}`,
          inline: true
        },
        ...(signal.microPointValue ? [{
          name: '⚡ Micro Contract',
          value: `**Point Value:** $${signal.microPointValue}\n**Max Risk:** $${microMaxRisk?.toFixed(0)}\n**T1 Profit:** $${microProfit1?.toFixed(0)}`,
          inline: true
        }] : []),
        {
          name: `${metadata.emoji} Position Management`,
          value: `**Breakeven:** $${signal.breakeven.toFixed(2)}\n**Scale Out:** 1/3 at each target\n**Trail Stop:** After T1 hit`,
          inline: true
        }
      ],
      footer: {
        text: `${metadata.name} • ${signal.strategy} • Risk Management Protocol • ${signal.time}`,
        icon_url: 'https://example.com/logo.png'
      },
      timestamp: new Date().toISOString()
    }]
  }
}

// Follow-through signal formatters
export function formatBreakevenSignal(originalSignal: ProfessionalSignal, currentPrice: number) {
  const metadata = SYMBOL_METADATA[originalSignal.symbol as keyof typeof SYMBOL_METADATA]
  
  return {
    embeds: [{
      title: `${metadata.emoji} BREAKEVEN ALERT - ${originalSignal.symbol}`,
      description: `**MOVE STOP TO BREAKEVEN** - Position is now risk-free!`,
      color: 0xffff00, // Yellow for breakeven
      fields: [
        {
          name: '🟡 Breakeven Management',
          value: `**Current Price:** $${currentPrice.toFixed(2)}\n**Move Stop To:** $${originalSignal.entry.toFixed(2)}\n**Status:** Risk-Free Position`,
          inline: true
        },
        {
          name: '🎯 Next Targets',
          value: `**T1:** $${originalSignal.target1.toFixed(2)}\n**T2:** $${originalSignal.target2.toFixed(2)}\n**Action:** Hold for targets`,
          inline: true
        }
      ],
      footer: {
        text: `${metadata.name} • Breakeven Management • ${new Date().toLocaleString()}`,
      },
      timestamp: new Date().toISOString()
    }]
  }
}

export function formatTargetHitSignal(originalSignal: ProfessionalSignal, targetNumber: number, currentPrice: number) {
  const metadata = SYMBOL_METADATA[originalSignal.symbol as keyof typeof SYMBOL_METADATA]
  const targetPrice = targetNumber === 1 ? originalSignal.target1 : originalSignal.target2
  const profit = Math.abs(targetPrice - originalSignal.entry) * originalSignal.pointValue
  
  return {
    embeds: [{
      title: `${metadata.emoji} TARGET ${targetNumber} HIT - ${originalSignal.symbol}`,
      description: `**PROFIT TAKING TIME** - T${targetNumber} reached!`,
      color: 0x00ff00, // Green for profit
      fields: [
        {
          name: '🎯 Target Hit',
          value: `**Target ${targetNumber}:** $${targetPrice.toFixed(2)}\n**Current Price:** $${currentPrice.toFixed(2)}\n**Profit:** $${profit.toFixed(0)}`,
          inline: true
        },
        {
          name: '📊 Position Management',
          value: targetNumber === 1 
            ? `**Action:** Take 1/3 position\n**Remaining:** 2/3 position\n**Trail Stop:** Move to breakeven`
            : `**Action:** Take 1/2 remaining\n**Remaining:** 1/3 position\n**Trail Stop:** Move to T1`,
          inline: true
        }
      ],
      footer: {
        text: `${metadata.name} • Target Management • ${new Date().toLocaleString()}`,
      },
      timestamp: new Date().toISOString()
    }]
  }
}

export function formatStopOutSignal(originalSignal: ProfessionalSignal, currentPrice: number, outcome: 'WIN' | 'LOSS') {
  const metadata = SYMBOL_METADATA[originalSignal.symbol as keyof typeof SYMBOL_METADATA]
  const result = outcome === 'WIN' ? 'STOPPED OUT FOR PROFIT' : 'STOPPED OUT FOR LOSS'
  const color = outcome === 'WIN' ? 0x00ff00 : 0xff0000
  
  return {
    embeds: [{
      title: `${metadata.emoji} ${result} - ${originalSignal.symbol}`,
      description: `**POSITION CLOSED** - ${outcome === 'WIN' ? 'Profitable exit' : 'Risk management executed'}`,
      color: color,
      fields: [
        {
          name: '🏁 Final Result',
          value: `**Entry:** $${originalSignal.entry.toFixed(2)}\n**Exit:** $${currentPrice.toFixed(2)}\n**Outcome:** ${outcome}`,
          inline: true
        },
        {
          name: '📊 Trade Summary',
          value: `**Direction:** ${originalSignal.direction}\n**Strategy:** ${originalSignal.strategy}\n**Result:** ${outcome === 'WIN' ? '✅ Profitable' : '❌ Loss'}`,
          inline: true
        }
      ],
      footer: {
        text: `${metadata.name} • Trade Closed • ${new Date().toLocaleString()}`,
      },
      timestamp: new Date().toISOString()
    }]
  }
}

// Generate signal ID for tracking
export function generateSignalId(): string {
  return `SIG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Example professional signal data
export function createExampleSignal(symbol: string): ProfessionalSignal {
  const basePrice = symbol === 'ES' ? 4500 : symbol === 'NQ' ? 15000 : symbol === 'CL' ? 75 : 100
  
  return {
    symbol: symbol,
    direction: 'LONG',
    entry: basePrice,
    confidence: 85,
    strategy: 'Channel Test',
    time: new Date().toLocaleString(),
    stopLoss: basePrice - (basePrice * 0.01), // 1% stop
    breakeven: basePrice + (basePrice * 0.005), // 0.5% breakeven
    target1: basePrice + (basePrice * 0.015), // 1.5% T1
    target2: basePrice + (basePrice * 0.03), // 3% T2
    riskPerContract: 500,
    maxRisk: 5000,
    positionSize: 2,
    pointValue: symbol === 'ES' ? 50 : symbol === 'NQ' ? 20 : symbol === 'CL' ? 1000 : 100,
    microPointValue: symbol === 'ES' ? 5 : symbol === 'NQ' ? 2 : symbol === 'CL' ? 100 : 10,
    signalId: generateSignalId(),
    signalType: 'ENTRY'
  }
}
