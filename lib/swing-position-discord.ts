import { createClient } from '@supabase/supabase-js'
import { discordWebhookManager } from './database-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SwingPosition {
  id: string
  symbol: string
  company_name: string
  entry_date: string
  entry_price: number
  current_price: number
  position_size: number
  stop_loss: number
  target_price_1: number
  target_price_2?: number
  target_price_3?: number
  status: 'ACTIVE' | 'CLOSED' | 'STOPPED_OUT'
  confidence_level: number
  entry_reasoning: string
  unrealized_pnl: number
  realized_pnl?: number
  exit_date?: string
  exit_price?: number
  exit_reasoning?: string
}

export interface PositionUpdate {
  type: 'ENTRY' | 'UPDATE' | 'EXIT' | 'STOP_LOSS_UPDATE' | 'TARGET_HIT'
  position: SwingPosition
  oldValues?: Partial<SwingPosition>
  newValues?: Partial<SwingPosition>
  notes?: string
}

export class SwingPositionDiscordManager {
  private static readonly CHANNEL_NAME = 'SWING_POSITIONS'

  // Professional Discord message templates
  static formatEntryMessage(position: SwingPosition): any {
    const riskAmount = Math.abs((position.entry_price - position.stop_loss) * position.position_size)
    const riskPercent = ((Math.abs(position.entry_price - position.stop_loss) / position.entry_price) * 100).toFixed(2)
    const target1Reward = Math.abs(position.target_price_1 - position.entry_price) * position.position_size
    const rewardRiskRatio = (target1Reward / riskAmount).toFixed(2)

    return {
      embeds: [{
        title: `🎯 NEW SWING POSITION ENTRY`,
        description: `**${position.symbol} - ${position.company_name}**\n\n📊 **Position Details**`,
        color: 0x00ff00, // Green for entry
        fields: [
          {
            name: '📈 Entry Information',
            value: `**Symbol:** ${position.symbol}\n**Entry Price:** $${position.entry_price.toFixed(2)}\n**Position Size:** ${position.position_size.toLocaleString()} shares\n**Confidence:** ${position.confidence_level}/10`,
            inline: true
          },
          {
            name: '🛡️ Risk Management',
            value: `**Stop Loss:** $${position.stop_loss.toFixed(2)}\n**Risk per Share:** $${Math.abs(position.entry_price - position.stop_loss).toFixed(2)}\n**Total Risk:** $${riskAmount.toFixed(2)} (${riskPercent}%)`,
            inline: true
          },
          {
            name: '🎯 Profit Targets',
            value: `**Target 1:** $${position.target_price_1.toFixed(2)}\n${position.target_price_2 ? `**Target 2:** $${position.target_price_2.toFixed(2)}\n` : ''}${position.target_price_3 ? `**Target 3:** $${position.target_price_3.toFixed(2)}\n` : ''}**R:R Ratio:** 1:${rewardRiskRatio}`,
            inline: false
          },
          {
            name: '💡 Entry Reasoning',
            value: position.entry_reasoning || 'Technical analysis and market conditions support this entry.',
            inline: false
          },
          {
            name: '📋 Position Management',
            value: `**Status:** ACTIVE\n**Entry Date:** ${new Date(position.entry_date).toLocaleDateString()}\n**Position ID:** ${position.id}`,
            inline: true
          },
          {
            name: '⚖️ Portfolio Impact',
            value: `**Position Value:** $${(position.entry_price * position.position_size).toLocaleString()}\n**Risk Allocation:** ${riskPercent}%\n**Expected Return:** $${target1Reward.toFixed(2)}`,
            inline: true
          }
        ],
        footer: {
          text: `Nexural Trading • Swing Position Entry • ${new Date().toLocaleString()}`,
          icon_url: 'https://example.com/logo.png'
        },
        timestamp: new Date().toISOString()
      }]
    }
  }

  static formatUpdateMessage(update: PositionUpdate): any {
    const position = update.position
    const currentValue = position.current_price * position.position_size
    const entryValue = position.entry_price * position.position_size
    const unrealizedPnL = currentValue - entryValue
    const pnlPercent = ((unrealizedPnL / entryValue) * 100).toFixed(2)
    const pnlColor = unrealizedPnL >= 0 ? 0x00ff00 : 0xff0000

    let title = '📊 SWING POSITION UPDATE'
    let description = `**${position.symbol} - ${position.company_name}**\n\n`

    switch (update.type) {
      case 'STOP_LOSS_UPDATE':
        title = '🛡️ STOP LOSS UPDATED'
        description += `Stop loss has been adjusted for better risk management.`
        break
      case 'TARGET_HIT':
        title = '🎯 TARGET HIT!'
        description += `Price target has been reached. Consider taking profits.`
        break
      case 'UPDATE':
        description += `Position update with current market conditions.`
        break
    }

    return {
      embeds: [{
        title,
        description,
        color: pnlColor,
        fields: [
          {
            name: '📈 Current Status',
            value: `**Current Price:** $${position.current_price.toFixed(2)}\n**Entry Price:** $${position.entry_price.toFixed(2)}\n**Price Change:** ${((position.current_price - position.entry_price) / position.entry_price * 100).toFixed(2)}%`,
            inline: true
          },
          {
            name: '💰 P&L Analysis',
            value: `**Unrealized P&L:** ${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toFixed(2)}\n**P&L Percentage:** ${pnlPercent}%\n**Position Value:** $${currentValue.toLocaleString()}`,
            inline: true
          },
          {
            name: '🛡️ Risk Levels',
            value: `**Stop Loss:** $${position.stop_loss.toFixed(2)}\n**Distance to Stop:** ${((position.current_price - position.stop_loss) / position.current_price * 100).toFixed(2)}%\n**Risk Status:** ${position.current_price > position.stop_loss ? '✅ Safe' : '⚠️ At Risk'}`,
            inline: false
          },
          {
            name: '🎯 Target Progress',
            value: `**Target 1:** $${position.target_price_1.toFixed(2)} ${position.current_price >= position.target_price_1 ? '✅' : '⏳'}\n${position.target_price_2 ? `**Target 2:** $${position.target_price_2.toFixed(2)} ${position.current_price >= position.target_price_2 ? '✅' : '⏳'}\n` : ''}${position.target_price_3 ? `**Target 3:** $${position.target_price_3.toFixed(2)} ${position.current_price >= position.target_price_3 ? '✅' : '⏳'}` : ''}`,
            inline: true
          },
          {
            name: '📊 Position Details',
            value: `**Status:** ${position.status}\n**Confidence:** ${position.confidence_level}/10\n**Days Held:** ${Math.floor((Date.now() - new Date(position.entry_date).getTime()) / (1000 * 60 * 60 * 24))}`,
            inline: true
          }
        ],
        footer: {
          text: `Nexural Trading • Position Update • ${new Date().toLocaleString()}`,
          icon_url: 'https://example.com/logo.png'
        },
        timestamp: new Date().toISOString()
      }]
    }
  }

  static formatExitMessage(position: SwingPosition): any {
    const entryValue = position.entry_price * position.position_size
    const exitValue = (position.exit_price || position.current_price) * position.position_size
    const realizedPnL = exitValue - entryValue
    const pnlPercent = ((realizedPnL / entryValue) * 100).toFixed(2)
    const pnlColor = realizedPnL >= 0 ? 0x00ff00 : 0xff0000
    const daysHeld = Math.floor((Date.now() - new Date(position.entry_date).getTime()) / (1000 * 60 * 60 * 24))

    let exitReason = 'Position closed'
    if (position.status === 'STOPPED_OUT') {
      exitReason = 'Stop loss triggered'
    } else if (position.exit_reasoning) {
      exitReason = position.exit_reasoning
    }

    return {
      embeds: [{
        title: `🏁 SWING POSITION CLOSED`,
        description: `**${position.symbol} - ${position.company_name}**\n\n${exitReason}`,
        color: pnlColor,
        fields: [
          {
            name: '📊 Trade Summary',
            value: `**Entry Price:** $${position.entry_price.toFixed(2)}\n**Exit Price:** $${(position.exit_price || position.current_price).toFixed(2)}\n**Price Change:** ${(((position.exit_price || position.current_price) - position.entry_price) / position.entry_price * 100).toFixed(2)}%`,
            inline: true
          },
          {
            name: '💰 Final P&L',
            value: `**Realized P&L:** ${realizedPnL >= 0 ? '+' : ''}$${realizedPnL.toFixed(2)}\n**P&L Percentage:** ${pnlPercent}%\n**Position Size:** ${position.position_size.toLocaleString()} shares`,
            inline: true
          },
          {
            name: '⏱️ Trade Duration',
            value: `**Entry Date:** ${new Date(position.entry_date).toLocaleDateString()}\n**Exit Date:** ${new Date(position.exit_date || Date.now()).toLocaleDateString()}\n**Days Held:** ${daysHeld} days`,
            inline: false
          },
          {
            name: '🎯 Target Analysis',
            value: `**Target 1:** $${position.target_price_1.toFixed(2)} ${(position.exit_price || position.current_price) >= position.target_price_1 ? '✅ Hit' : '❌ Missed'}\n${position.target_price_2 ? `**Target 2:** $${position.target_price_2.toFixed(2)} ${(position.exit_price || position.current_price) >= position.target_price_2 ? '✅ Hit' : '❌ Missed'}\n` : ''}${position.target_price_3 ? `**Target 3:** $${position.target_price_3.toFixed(2)} ${(position.exit_price || position.current_price) >= position.target_price_3 ? '✅ Hit' : '❌ Missed'}` : ''}`,
            inline: true
          },
          {
            name: '📈 Performance Metrics',
            value: `**Status:** ${position.status}\n**Confidence:** ${position.confidence_level}/10\n**Trade Result:** ${realizedPnL >= 0 ? '🟢 Winner' : '🔴 Loser'}`,
            inline: true
          }
        ],
        footer: {
          text: `Nexural Trading • Position Closed • ${new Date().toLocaleString()}`,
          icon_url: 'https://example.com/logo.png'
        },
        timestamp: new Date().toISOString()
      }]
    }
  }

  // Send position update to Discord
  static async sendPositionUpdate(update: PositionUpdate): Promise<boolean> {
    try {
      let message: any

      switch (update.type) {
        case 'ENTRY':
          message = this.formatEntryMessage(update.position)
          break
        case 'EXIT':
          message = this.formatExitMessage(update.position)
          break
        case 'UPDATE':
        case 'STOP_LOSS_UPDATE':
        case 'TARGET_HIT':
          message = this.formatUpdateMessage(update)
          break
        default:
          console.error('Unknown update type:', update.type)
          return false
      }

      const success = await discordWebhookManager.sendWebhook(this.CHANNEL_NAME, message)
      
      if (success) {
        // Log the update in database
        await this.logPositionUpdate(update)
        console.log(`✅ Swing position ${update.type} sent to Discord: ${update.position.symbol}`)
      } else {
        console.error(`❌ Failed to send swing position ${update.type} to Discord: ${update.position.symbol}`)
      }

      return success
    } catch (error) {
      console.error('Error sending position update to Discord:', error)
      return false
    }
  }

  // Log position update in database
  private static async logPositionUpdate(update: PositionUpdate): Promise<void> {
    try {
      await supabase.from('position_updates_log').insert({
        position_id: parseInt(update.position.id),
        update_type: update.type,
        old_values: update.oldValues || null,
        new_values: update.newValues || null,
        discord_sent: true,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error logging position update:', error)
    }
  }

  // Send daily position summary
  static async sendDailyPositionSummary(): Promise<boolean> {
    try {
      // Get all active positions
      const { data: positions, error } = await supabase
        .from('positions')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('entry_date', { ascending: false })

      if (error) {
        console.error('Error fetching positions for daily summary:', error)
        return false
      }

      if (!positions || positions.length === 0) {
        return true // No positions to report
      }

      const totalValue = positions.reduce((sum, pos) => sum + (pos.current_price * pos.position_size), 0)
      const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealized_pnl, 0)
      const totalPnLPercent = ((totalUnrealizedPnL / (totalValue - totalUnrealizedPnL)) * 100).toFixed(2)

      const message = {
        embeds: [{
          title: '📊 DAILY SWING POSITIONS SUMMARY',
          description: `**Portfolio Overview - ${new Date().toLocaleDateString()}**`,
          color: totalUnrealizedPnL >= 0 ? 0x00ff00 : 0xff0000,
          fields: [
            {
              name: '📈 Portfolio Metrics',
              value: `**Active Positions:** ${positions.length}\n**Total Portfolio Value:** $${totalValue.toLocaleString()}\n**Total Unrealized P&L:** ${totalUnrealizedPnL >= 0 ? '+' : ''}$${totalUnrealizedPnL.toFixed(2)} (${totalPnLPercent}%)`,
              inline: false
            },
            {
              name: '🎯 Active Positions',
              value: positions.slice(0, 10).map(pos => 
                `**${pos.symbol}:** $${pos.current_price.toFixed(2)} (${pos.unrealized_pnl >= 0 ? '+' : ''}$${pos.unrealized_pnl.toFixed(2)})`
              ).join('\n') + (positions.length > 10 ? `\n... and ${positions.length - 10} more` : ''),
              inline: false
            }
          ],
          footer: {
            text: `Nexural Trading • Daily Summary • ${new Date().toLocaleString()}`,
            icon_url: 'https://example.com/logo.png'
          },
          timestamp: new Date().toISOString()
        }]
      }

      return await discordWebhookManager.sendWebhook(this.CHANNEL_NAME, message)
    } catch (error) {
      console.error('Error sending daily position summary:', error)
      return false
    }
  }

  // Test swing position webhook
  static async testSwingPositionWebhook(): Promise<boolean> {
    const testPosition: SwingPosition = {
      id: 'TEST_001',
      symbol: 'AAPL',
      company_name: 'Apple Inc.',
      entry_date: new Date().toISOString(),
      entry_price: 175.50,
      current_price: 178.25,
      position_size: 100,
      stop_loss: 170.00,
      target_price_1: 185.00,
      target_price_2: 195.00,
      status: 'ACTIVE',
      confidence_level: 8,
      entry_reasoning: 'Strong technical breakout above resistance with high volume confirmation. RSI showing bullish momentum.',
      unrealized_pnl: 275.00
    }

    const testUpdate: PositionUpdate = {
      type: 'ENTRY',
      position: testPosition
    }

    return await this.sendPositionUpdate(testUpdate)
  }
}

// Export for use in other modules
export const swingPositionDiscord = SwingPositionDiscordManager

// Utility functions for position management
export async function notifyPositionEntry(position: SwingPosition): Promise<boolean> {
  return await SwingPositionDiscordManager.sendPositionUpdate({
    type: 'ENTRY',
    position
  })
}

export async function notifyPositionUpdate(position: SwingPosition, oldValues?: Partial<SwingPosition>): Promise<boolean> {
  return await SwingPositionDiscordManager.sendPositionUpdate({
    type: 'UPDATE',
    position,
    oldValues
  })
}

export async function notifyPositionExit(position: SwingPosition): Promise<boolean> {
  return await SwingPositionDiscordManager.sendPositionUpdate({
    type: 'EXIT',
    position
  })
}

export async function notifyStopLossUpdate(position: SwingPosition, oldStopLoss: number): Promise<boolean> {
  return await SwingPositionDiscordManager.sendPositionUpdate({
    type: 'STOP_LOSS_UPDATE',
    position,
    oldValues: { stop_loss: oldStopLoss },
    newValues: { stop_loss: position.stop_loss }
  })
}

export async function notifyTargetHit(position: SwingPosition, targetLevel: number): Promise<boolean> {
  return await SwingPositionDiscordManager.sendPositionUpdate({
    type: 'TARGET_HIT',
    position,
    notes: `Target ${targetLevel} hit at $${position.current_price.toFixed(2)}`
  })
}
