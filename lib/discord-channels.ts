/**
 * Discord Multi-Channel Router
 * 
 * Routes trading signals to appropriate Discord channels
 */

import { DiscordWebhook } from './discord-webhook'

export type ChannelType = 'selling' | 'swings' | 'default'
export type SignalType = 'options' | 'swing' | 'day_trade' | 'position'

/**
 * Get Discord webhook for specific channel
 */
export function getDiscordChannel(channel: ChannelType = 'default'): DiscordWebhook | null {
  let webhookUrl: string | undefined

  switch (channel) {
    case 'selling':
      webhookUrl = process.env.DISCORD_WEBHOOK_SELLING || process.env.DISCORD_WEBHOOK_URL
      break
    case 'swings':
      webhookUrl = process.env.DISCORD_WEBHOOK_SWINGS
      break
    case 'default':
    default:
      webhookUrl = process.env.DISCORD_WEBHOOK_URL
      break
  }

  if (!webhookUrl) {
    console.warn(`Discord webhook URL not configured for channel: ${channel}`)
    return null
  }

  return new DiscordWebhook(webhookUrl)
}

/**
 * Route signal to appropriate channel based on type
 */
export function routeSignal(signalType: SignalType): ChannelType {
  switch (signalType) {
    case 'options':
      return 'selling' // Options go to selling channel
    case 'swing':
      return 'swings' // Swing trades go to swings channel
    case 'day_trade':
      return 'selling' // Day trades go to selling channel
    case 'position':
    default:
      return 'default' // Everything else to default
  }
}

/**
 * Send notification with automatic routing
 */
export async function sendRoutedNotification(
  signalType: SignalType,
  notificationFn: (webhook: DiscordWebhook) => Promise<boolean>
): Promise<boolean> {
  const channel = routeSignal(signalType)
  const webhook = getDiscordChannel(channel)

  if (!webhook) {
    console.warn(`No webhook configured for ${channel} channel`)
    return false
  }

  try {
    return await notificationFn(webhook)
  } catch (error) {
    console.error(`Failed to send notification to ${channel}:`, error)
    return false
  }
}

/**
 * Test all configured channels
 */
export async function testAllChannels(): Promise<{
  selling: boolean
  swings: boolean
  default: boolean
}> {
  const results = {
    selling: false,
    swings: false,
    default: false,
  }

  // Test selling channel
  const sellingWebhook = getDiscordChannel('selling')
  if (sellingWebhook) {
    results.selling = await sellingWebhook.sendCustom(
      'Test message from Nexural Trading System! 🎯',
      'Selling Signals Channel Test'
    )
  }

  // Test swings channel
  const swingsWebhook = getDiscordChannel('swings')
  if (swingsWebhook) {
    results.swings = await swingsWebhook.sendCustom(
      'Test message from Nexural Trading System! 📈',
      'Swings Channel Test'
    )
  }

  // Test default channel
  const defaultWebhook = getDiscordChannel('default')
  if (defaultWebhook) {
    results.default = await defaultWebhook.sendCustom(
      'Test message from Nexural Trading System! ✅',
      'Default Channel Test'
    )
  }

  return results
}
