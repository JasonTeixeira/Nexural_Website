/**
 * Discord Webhook Utility
 * 
 * Sends trading activity notifications to Discord channels
 */

interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: DiscordEmbedField[]
  timestamp?: string
  footer?: {
    text: string
  }
  author?: {
    name: string
    url?: string
    icon_url?: string
  }
}

interface DiscordWebhookPayload {
  content?: string
  username?: string
  avatar_url?: string
  embeds?: DiscordEmbed[]
}

export class DiscordWebhook {
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  /**
   * Send a message to Discord
   */
  async send(payload: DiscordWebhookPayload): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Discord webhook failed:', response.statusText)
        return false
      }

      return true
    } catch (error) {
      console.error('Discord webhook error:', error)
      return false
    }
  }

  /**
   * Notify position entry
   */
  async notifyEntry(data: {
    ticker: string
    companyName: string
    direction: 'long' | 'short'
    entryPrice: number
    shares: number
    positionValue: number
    stopLoss: number
    target: number
    riskReward: string
    setup: string
    conviction: string
    isHedge?: boolean
    thesis?: string
    positionUrl?: string
  }): Promise<boolean> {
    const color = data.direction === 'long' ? 0x22c55e : 0xef4444 // Green for long, Red for short
    const emoji = data.direction === 'long' ? '📈' : '📉'
    const hedgeIndicator = data.isHedge ? ' 🛡️ [HEDGE]' : ''

    const embed: DiscordEmbed = {
      title: `${emoji} New ${data.direction.toUpperCase()} Position: ${data.ticker}${hedgeIndicator}`,
      description: data.companyName,
      color,
      fields: [
        {
          name: 'Entry Price',
          value: `$${data.entryPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Shares',
          value: data.shares.toString(),
          inline: true,
        },
        {
          name: 'Position Value',
          value: `$${data.positionValue.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Stop Loss',
          value: `$${data.stopLoss.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Target',
          value: `$${data.target.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Risk:Reward',
          value: `1:${data.riskReward}`,
          inline: true,
        },
        {
          name: 'Setup',
          value: data.setup.replace(/_/g, ' ').toUpperCase(),
          inline: true,
        },
        {
          name: 'Conviction',
          value: data.conviction.toUpperCase(),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Nexural Trading',
      },
    }

    if (data.thesis) {
      embed.fields?.push({
        name: 'Thesis',
        value: data.thesis.length > 200 ? data.thesis.substring(0, 197) + '...' : data.thesis,
        inline: false,
      })
    }

    if (data.positionUrl) {
      embed.description = `${data.companyName}\n\n[View Position](${data.positionUrl})`
    }

    return this.send({ embeds: [embed] })
  }

  /**
   * Notify position exit
   */
  async notifyExit(data: {
    ticker: string
    companyName: string
    direction: 'long' | 'short'
    exitPrice: number
    shares: number
    pnl: number
    pnlPct: number
    rMultiple: number
    daysHeld: number
    isHedge?: boolean
    reason?: string
    positionUrl?: string
  }): Promise<boolean> {
    const color = data.pnl >= 0 ? 0x22c55e : 0xef4444 // Green for profit, Red for loss
    const emoji = data.pnl >= 0 ? '✅' : '❌'
    const pnlPrefix = data.pnl >= 0 ? '+' : ''
    const hedgeIndicator = data.isHedge ? ' 🛡️ [HEDGE]' : ''

    const embed: DiscordEmbed = {
      title: `${emoji} Closed ${data.ticker}${hedgeIndicator} - ${pnlPrefix}$${data.pnl.toFixed(2)} (${pnlPrefix}${data.pnlPct.toFixed(2)}%)`,
      description: data.companyName,
      color,
      fields: [
        {
          name: 'Exit Price',
          value: `$${data.exitPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Shares',
          value: data.shares.toString(),
          inline: true,
        },
        {
          name: 'P&L',
          value: `${pnlPrefix}$${data.pnl.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'P&L %',
          value: `${pnlPrefix}${data.pnlPct.toFixed(2)}%`,
          inline: true,
        },
        {
          name: 'R-Multiple',
          value: `${data.rMultiple.toFixed(2)}R`,
          inline: true,
        },
        {
          name: 'Days Held',
          value: data.daysHeld.toString(),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Nexural Trading',
      },
    }

    if (data.reason) {
      embed.fields?.push({
        name: 'Exit Reason',
        value: data.reason,
        inline: false,
      })
    }

    if (data.positionUrl) {
      embed.description = `${data.companyName}\n\n[View Position](${data.positionUrl})`
    }

    return this.send({ embeds: [embed] })
  }

  /**
   * Notify position update (add/trim)
   */
  async notifyUpdate(data: {
    ticker: string
    companyName: string
    action: 'add' | 'trim'
    price: number
    shares: number
    totalShares: number
    newAvgPrice?: number
    isHedge?: boolean
    note?: string
    positionUrl?: string
  }): Promise<boolean> {
    const color = data.action === 'add' ? 0x3b82f6 : 0xf59e0b // Blue for add, Orange for trim
    const emoji = data.action === 'add' ? '➕' : '➖'
    const actionText = data.action === 'add' ? 'Added to' : 'Trimmed'
    const hedgeIndicator = data.isHedge ? ' 🛡️ [HEDGE]' : ''

    const embed: DiscordEmbed = {
      title: `${emoji} ${actionText} ${data.ticker}${hedgeIndicator}`,
      description: data.companyName,
      color,
      fields: [
        {
          name: 'Price',
          value: `$${data.price.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Shares',
          value: `${data.shares > 0 ? '+' : ''}${data.shares}`,
          inline: true,
        },
        {
          name: 'Total Shares',
          value: data.totalShares.toString(),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Nexural Trading',
      },
    }

    if (data.newAvgPrice) {
      embed.fields?.push({
        name: 'New Avg Price',
        value: `$${data.newAvgPrice.toFixed(2)}`,
        inline: true,
      })
    }

    if (data.note) {
      embed.fields?.push({
        name: 'Note',
        value: data.note,
        inline: false,
      })
    }

    if (data.positionUrl) {
      embed.description = `${data.companyName}\n\n[View Position](${data.positionUrl})`
    }

    return this.send({ embeds: [embed] })
  }

  /**
   * Notify target hit
   */
  async notifyTargetHit(data: {
    ticker: string
    companyName: string
    targetNumber: number
    targetPrice: number
    currentPrice: number
    pnl: number
    pnlPct: number
    rMultiple: number
    positionUrl?: string
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: `🎯 Target ${data.targetNumber} Hit: ${data.ticker}`,
      description: data.companyName,
      color: 0x10b981, // Emerald
      fields: [
        {
          name: 'Target Price',
          value: `$${data.targetPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Current Price',
          value: `$${data.currentPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'P&L',
          value: `+$${data.pnl.toFixed(2)} (+${data.pnlPct.toFixed(2)}%)`,
          inline: true,
        },
        {
          name: 'R-Multiple',
          value: `${data.rMultiple.toFixed(2)}R`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Nexural Trading',
      },
    }

    if (data.positionUrl) {
      embed.description = `${data.companyName}\n\n[View Position](${data.positionUrl})`
    }

    return this.send({ embeds: [embed] })
  }

  /**
   * Notify stop loss hit
   */
  async notifyStopLoss(data: {
    ticker: string
    companyName: string
    stopPrice: number
    exitPrice: number
    pnl: number
    pnlPct: number
    rMultiple: number
    positionUrl?: string
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: `🛑 Stop Loss Hit: ${data.ticker}`,
      description: data.companyName,
      color: 0xef4444, // Red
      fields: [
        {
          name: 'Stop Price',
          value: `$${data.stopPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Exit Price',
          value: `$${data.exitPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'P&L',
          value: `${data.pnl.toFixed(2)} (${data.pnlPct.toFixed(2)}%)`,
          inline: true,
        },
        {
          name: 'R-Multiple',
          value: `${data.rMultiple.toFixed(2)}R`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Nexural Trading',
      },
    }

    if (data.positionUrl) {
      embed.description = `${data.companyName}\n\n[View Position](${data.positionUrl})`
    }

    return this.send({ embeds: [embed] })
  }

  /**
   * Notify options position entry
   */
  async notifyOptionsEntry(data: {
    ticker: string
    companyName: string
    strategyType: 'put_credit_spread' | 'call_credit_spread' | 'iron_condor'
    expiration: string
    daysToExpiration: number
    legs: Array<{
      type: string
      strike: number
      contracts: number
      premium: number
      symbol: string
    }>
    premiumCollected: number
    maxProfit: number
    maxLoss: number
    breakEvenLower?: number
    breakEvenUpper?: number
    probabilityOfProfit?: number
    isHedge?: boolean
    thesis?: string
    positionUrl?: string
  }): Promise<boolean> {
    const strategyInfo = {
      put_credit_spread: { name: 'BULL PUT SPREAD', color: 0x22c55e, emoji: '📈' },
      call_credit_spread: { name: 'BEAR CALL SPREAD', color: 0xef4444, emoji: '📉' },
      iron_condor: { name: 'IRON CONDOR', color: 0x8b5cf6, emoji: '⚖️' },
    }

    const strategy = strategyInfo[data.strategyType]
    const hedgeIndicator = data.isHedge ? ' 🛡️ [HEDGE]' : ''

    const embed: DiscordEmbed = {
      title: `${strategy.emoji} New ${strategy.name}${hedgeIndicator}`,
      description: `${data.ticker} - ${data.companyName}`,
      color: strategy.color,
      fields: [
        {
          name: 'Expiration',
          value: `${data.expiration} (${data.daysToExpiration} DTE)`,
          inline: true,
        },
        {
          name: 'Premium Collected',
          value: `$${data.premiumCollected.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Strategy',
          value: strategy.name,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Nexural Trading',
      },
    }

    // Add legs
    const legsText = data.legs
      .map(leg => `${leg.type} $${leg.strike} x${leg.contracts} @ $${leg.premium.toFixed(2)}`)
      .join('\n')
    
    embed.fields?.push({
      name: 'Legs',
      value: legsText,
      inline: false,
    })

    // Add risk/reward
    embed.fields?.push(
      {
        name: 'Max Profit',
        value: `$${data.maxProfit.toFixed(2)}`,
        inline: true,
      },
      {
        name: 'Max Loss',
        value: `$${data.maxLoss.toFixed(2)}`,
        inline: true,
      }
    )

    if (data.probabilityOfProfit) {
      embed.fields?.push({
        name: 'Probability of Profit',
        value: `${data.probabilityOfProfit.toFixed(0)}%`,
        inline: true,
      })
    }

    // Add break-evens
    if (data.breakEvenLower || data.breakEvenUpper) {
      const breakEvens = []
      if (data.breakEvenLower) breakEvens.push(`Lower: $${data.breakEvenLower.toFixed(2)}`)
      if (data.breakEvenUpper) breakEvens.push(`Upper: $${data.breakEvenUpper.toFixed(2)}`)
      
      embed.fields?.push({
        name: 'Break-even Points',
        value: breakEvens.join('\n'),
        inline: false,
      })
    }

    if (data.thesis) {
      embed.fields?.push({
        name: 'Thesis',
        value: data.thesis.length > 200 ? data.thesis.substring(0, 197) + '...' : data.thesis,
        inline: false,
      })
    }

    // Add option symbols
    const symbols = data.legs.map(leg => leg.symbol).join(', ')
    embed.fields?.push({
      name: 'Option Symbols',
      value: symbols,
      inline: false,
    })

    if (data.positionUrl) {
      embed.description = `${data.companyName}\n\n[View Position](${data.positionUrl})`
    }

    return this.send({ embeds: [embed] })
  }

  /**
   * Notify options position exit
   */
  async notifyOptionsExit(data: {
    ticker: string
    companyName: string
    strategyType: 'put_credit_spread' | 'call_credit_spread' | 'iron_condor'
    exitPrice: number
    premiumCollected: number
    pnl: number
    pnlPct: number
    daysHeld: number
    isHedge?: boolean
    reason?: string
    positionUrl?: string
  }): Promise<boolean> {
    const color = data.pnl >= 0 ? 0x22c55e : 0xef4444
    const emoji = data.pnl >= 0 ? '✅' : '❌'
    const pnlPrefix = data.pnl >= 0 ? '+' : ''

    const strategyNames = {
      put_credit_spread: 'Bull Put Spread',
      call_credit_spread: 'Bear Call Spread',
      iron_condor: 'Iron Condor',
    }

    const hedgeIndicator = data.isHedge ? ' 🛡️ [HEDGE]' : ''

    const embed: DiscordEmbed = {
      title: `${emoji} Closed ${data.ticker} ${strategyNames[data.strategyType]}${hedgeIndicator} - ${pnlPrefix}$${data.pnl.toFixed(2)}`,
      description: data.companyName,
      color,
      fields: [
        {
          name: 'Premium Collected',
          value: `$${data.premiumCollected.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Exit Price',
          value: `$${data.exitPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Days Held',
          value: data.daysHeld.toString(),
          inline: true,
        },
        {
          name: 'P&L',
          value: `${pnlPrefix}$${data.pnl.toFixed(2)}`,
          inline: true,
        },
        {
          name: 'P&L %',
          value: `${pnlPrefix}${data.pnlPct.toFixed(2)}%`,
          inline: true,
        },
        {
          name: 'Strategy',
          value: strategyNames[data.strategyType],
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Nexural Trading',
      },
    }

    if (data.reason) {
      embed.fields?.push({
        name: 'Exit Reason',
        value: data.reason,
        inline: false,
      })
    }

    if (data.positionUrl) {
      embed.description = `${data.companyName}\n\n[View Position](${data.positionUrl})`
    }

    return this.send({ embeds: [embed] })
  }

  /**
   * Send custom message
   */
  async sendCustom(message: string, title?: string): Promise<boolean> {
    if (title) {
      return this.send({
        embeds: [{
          title,
          description: message,
          color: 0x6366f1, // Indigo
          timestamp: new Date().toISOString(),
        }],
      })
    }

    return this.send({ content: message })
  }
}

/**
 * Get Discord webhook instance
 */
export function getDiscordWebhook(): DiscordWebhook | null {
  // Prefer channel-specific webhooks if present (supports selling vs swings)
  // Fallback to DISCORD_WEBHOOK_URL for legacy setups.
  const webhookUrl =
    process.env.DISCORD_WEBHOOK_SELLING ||
    process.env.DISCORD_WEBHOOK_SWINGS ||
    process.env.DISCORD_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured')
    return null
  }

  return new DiscordWebhook(webhookUrl)
}
