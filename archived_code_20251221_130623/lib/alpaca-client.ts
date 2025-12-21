/**
 * Alpaca API Client
 * 
 * FREE real-time stock data for swing positions
 * Paper trading account - no real money involved
 */

import Alpaca from '@alpacahq/alpaca-trade-api'

/**
 * Get Alpaca client instance
 */
export function getAlpacaClient(): Alpaca {
  const apiKey = process.env.ALPACA_API_KEY
  const secretKey = process.env.ALPACA_SECRET_KEY
  const baseUrl = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets'

  if (!apiKey || !secretKey) {
    throw new Error('Alpaca API credentials not configured')
  }

  return new Alpaca({
    keyId: apiKey,
    secretKey: secretKey,
    baseUrl: baseUrl,
    paper: true, // Paper trading account
  })
}

/**
 * Get latest price for a single ticker
 */
export async function getLatestPrice(ticker: string): Promise<number | null> {
  try {
    const alpaca = getAlpacaClient()
    
    // Get latest trade
    const latestTrade = await alpaca.getLatestTrade(ticker)
    
    if (latestTrade && latestTrade.Price) {
      return latestTrade.Price
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error)
    return null
  }
}

/**
 * Get latest prices for multiple tickers (batch request)
 */
export async function getLatestPrices(
  tickers: string[]
): Promise<Record<string, number>> {
  try {
    const alpaca = getAlpacaClient()
    const prices: Record<string, number> = {}
    
    // Get latest trades for all tickers
    const trades = await alpaca.getLatestTrades(tickers)
    
    // Extract prices (trades is a Map, not an object)
    for (const ticker of tickers) {
      const trade = trades.get(ticker)
      if (trade && trade.Price) {
        prices[ticker] = trade.Price
      }
    }
    
    return prices
  } catch (error) {
    console.error('Error fetching batch prices:', error)
    return {}
  }
}

/**
 * Check if market is currently open
 */
export async function isMarketOpen(): Promise<boolean> {
  try {
    const alpaca = getAlpacaClient()
    const clock = await alpaca.getClock()
    return clock.is_open
  } catch (error) {
    console.error('Error checking market status:', error)
    return false
  }
}

/**
 * Get market hours for today
 */
export async function getMarketHours(): Promise<{
  isOpen: boolean
  nextOpen: string
  nextClose: string
}> {
  try {
    const alpaca = getAlpacaClient()
    const clock = await alpaca.getClock()
    
    return {
      isOpen: clock.is_open,
      nextOpen: clock.next_open,
      nextClose: clock.next_close,
    }
  } catch (error) {
    console.error('Error getting market hours:', error)
    return {
      isOpen: false,
      nextOpen: '',
      nextClose: '',
    }
  }
}
