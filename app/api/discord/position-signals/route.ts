import { NextRequest, NextResponse } from 'next/server'
import { getDiscordChannel, routeSignal } from '@/lib/discord-channels'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface SignalPayload {
  type: 'position_opened' | 'position_closed' | 'stop_moved' | 'target_hit' | 'targets_updated'
  ticker: string
  companyName: string
  data: any
}

export async function POST(request: NextRequest) {
  try {
    const payload: SignalPayload = await request.json()
    
    let message = ''
    let color = 0x00ff00 // green
    
    switch (payload.type) {
      case 'position_opened':
        color = 0x00ff00
        message = `🚀 **New Position Opened**\n\n` +
          `**${payload.ticker}** - ${payload.companyName}\n` +
          `Entry: $${payload.data.entryPrice?.toFixed(2)}\n` +
          `Shares: ${payload.data.shares}\n` +
          `Stop: $${payload.data.stopLoss?.toFixed(2)}\n` +
          `Setup: ${payload.data.setupType || 'N/A'}\n` +
          `Risk: $${payload.data.riskDollars?.toFixed(2)} (${payload.data.riskPercent?.toFixed(1)}%)\n\n` +
          `**Thesis:** ${payload.data.entryThesis || 'N/A'}`
        break
        
      case 'stop_moved':
        color = 0xff6b00
        message = `🛡️ **Stop Loss Moved**\n\n` +
          `**${payload.ticker}** - ${payload.companyName}\n` +
          `Old Stop: $${payload.data.oldStop?.toFixed(2)}\n` +
          `New Stop: $${payload.data.newStop?.toFixed(2)}\n` +
          `Type: ${payload.data.stopType}\n` +
          `Reason: ${payload.data.reason}\n\n` +
          `Risk Impact: $${payload.data.oldRisk?.toFixed(2)} → $${payload.data.newRisk?.toFixed(2)}`
        break
        
      case 'target_hit':
        color = 0x00ff00
        message = `🎯 **Target Hit!**\n\n` +
          `**${payload.ticker}** - ${payload.companyName}\n` +
          `Target ${payload.data.targetNumber}: $${payload.data.targetPrice?.toFixed(2)}\n` +
          `Hit Price: $${payload.data.hitPrice?.toFixed(2)}\n` +
          `R-Multiple: ${payload.data.rMultiple?.toFixed(2)}R\n` +
          `Allocation: ${payload.data.allocation}%`
        break
        
      case 'targets_updated':
        color = 0xffff00
        message = `🎯 **Profit Targets Updated**\n\n` +
          `**${payload.ticker}** - ${payload.companyName}\n` +
          `Total Targets: ${payload.data.targets?.length || 0}\n` +
          `Projected Profit: $${payload.data.totalProfit?.toFixed(2)}\n` +
          `Weighted R: ${payload.data.weightedR?.toFixed(2)}R\n\n` +
          `${payload.data.note || ''}`
        break
        
      case 'position_closed':
        color = payload.data.profit > 0 ? 0x00ff00 : 0xff0000
        message = `${payload.data.profit > 0 ? '✅' : '❌'} **Position Closed**\n\n` +
          `**${payload.ticker}** - ${payload.companyName}\n` +
          `Entry: $${payload.data.entryPrice?.toFixed(2)}\n` +
          `Exit: $${payload.data.exitPrice?.toFixed(2)}\n` +
          `P&L: $${payload.data.profit?.toFixed(2)} (${payload.data.profitPct?.toFixed(1)}%)\n` +
          `R-Multiple: ${payload.data.rMultiple?.toFixed(2)}R\n` +
          `Hold Time: ${payload.data.holdDays} days\n\n` +
          `Grade: ${payload.data.grade || 'N/A'}`
        break
    }
    
    // Route to correct channel based on position type
    const signalType = payload.data.timeFrame === 'swing' ? 'swing' : 
                       payload.data.timeFrame === 'day' ? 'day_trade' : 'position'
    
    const channel = routeSignal(signalType)
    const webhook = getDiscordChannel(channel)
    
    if (!webhook) {
      throw new Error(`Discord webhook not configured for ${channel} channel`)
    }
    
    await webhook.send({
      embeds: [{
        description: message,
        color,
        timestamp: new Date().toISOString(),
        footer: { text: `Nexural Trading • ${signalType.toUpperCase()}` }
      }]
    })
    
    return NextResponse.json({ success: true, message: 'Signal sent to Discord' })
    
  } catch (error: any) {
    console.error('Discord signal error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
