// Discord Webhook Configuration for 18-Symbol Portfolio
// Professional Trading System Integration

export const DISCORD_WEBHOOKS = {
  // Existing 9 symbols (already configured)
  'ES': process.env.DISCORD_WEBHOOK_ES || '',
  'NQ': process.env.DISCORD_WEBHOOK_NQ || '',
  'RTY': process.env.DISCORD_WEBHOOK_RTY || '',
  'YM': process.env.DISCORD_WEBHOOK_YM || '',
  'CL': process.env.DISCORD_WEBHOOK_CL || '',
  'GC': process.env.DISCORD_WEBHOOK_GC || '',
  'SI': process.env.DISCORD_WEBHOOK_SI || '',
  'ETH': process.env.DISCORD_WEBHOOK_ETH || '',
  'BTC': process.env.DISCORD_WEBHOOK_BTC || '',
  
  // New 8 symbols - Direct webhook URLs
  'ZN': 'https://discord.com/api/webhooks/1420801618617696278/ryrIDlJQZuc3k0jVflI2RYcJleYB98alFzKag1oTNlje3UlkBEt3_VTi2sBmzp7l-Wl2',
  'EUR': 'https://discord.com/api/webhooks/1420801838168674306/4CsfVRWNkt1zZdPwsyFRYNYONyvwjlYRfbmMeXzQTjZNLBlGyIzE3dO2SSEb_4Fd7Qxa',
  'JPY': 'https://discord.com/api/webhooks/1420802053906628692/B47WAnfe5IMRhVqB37gPfoKzjZxBx-FsJNmmTbgX0rgIX91--hTs8bgjZg8IljGb2gI0',
  'NG': 'https://discord.com/api/webhooks/1420802271477891293/XaZWPcBu-mmaPoTZG0mNOrRndyDD3jIga-af8sPDGYhkdwwK6ajkXj3srJfOEdog4M-G',
  'HG': 'https://discord.com/api/webhooks/1420802429896884234/1pzgZeKst8BOUUERy6PR7cAc6Xcv6RL7J7f-n4m-4M0S6sgcPdqd3PU7IPoIHmT5rFGN',
  'ZC': 'https://discord.com/api/webhooks/1420802575216803921/JnvBweuHDq8VL_iKFFpzYjbaYyivyfwZsr8VwIv8HpeBX50Vch1ir6Uxc9DLz0BSe7oA',
  'ZS': 'https://discord.com/api/webhooks/1420802681798267051/8OESps3TY-CmK917NiQfZs2IL_0jFdwt0eptDE_kCr1PaluO7n6jK6QwerZZYY-a1NbV',
  'ZW': 'https://discord.com/api/webhooks/1420802777575329966/DQAApWwMw1JFbw-NMUGJF-zDoPdLHDKgp-iSTNBPC4a2NCA1Ig3sPdGv-0DSjKsrEb5e',
  
  // New 4 symbols - VIX, AUD, CAD, CHF
  'VX': 'https://discord.com/api/webhooks/1422970143939629270/Tx3WknnRFDs9Pn-fviJbbLd8yV_N5IY-YNSP5BH5EPkgwnHGdyLt5dCKxPUvkpvJ95mI',
  'AUD': 'https://discord.com/api/webhooks/1422970509280280616/fhST7MWB4lVv9JO4dE94kTBtIJcCBm_HmbAqTiNBP3u1c3YgOHKjvjQpa2uZYqXOTeh_',
  'CAD': 'https://discord.com/api/webhooks/1422970396411428935/I_p0J4cPTI--OdK9N_17G83hH1_zEJJ2D9Su74OR7E0z2DrQmDnuw6CCTbAPlO-rXPE4',
  'CHF': 'https://discord.com/api/webhooks/1422970295131701289/wQlSVCeIHikimNaMNQocLWHIRFxmv_O_KE_hrdTmHCx59wrr7JP8rNpLsAoEL1OlQ6tW'
}

// Symbol metadata for professional formatting with micro contracts
export const SYMBOL_METADATA = {
  // Equity Indices - Full Size
  'ES': { name: 'E-mini S&P 500', category: 'Equity Indices', emoji: '🚀', color: 0x00ff00, micro: 'MES', description: 'Large Cap US Stocks' },
  'NQ': { name: 'E-mini NASDAQ-100', category: 'Equity Indices', emoji: '💻', color: 0x0099ff, micro: 'MNQ', description: 'Tech-Heavy Index' },
  'RTY': { name: 'E-mini Russell 2000', category: 'Equity Indices', emoji: '🏢', color: 0xff9900, micro: 'M2K', description: 'Small Cap US Stocks' },
  'YM': { name: 'E-mini Dow Jones', category: 'Equity Indices', emoji: '🏭', color: 0x0066cc, micro: 'MYM', description: 'Industrial Average' },
  
  // Equity Indices - Micro Size
  'MES': { name: 'Micro E-mini S&P 500', category: 'Micro Equity Indices', emoji: '🚀', color: 0x00ff00, full: 'ES', description: 'Micro S&P 500' },
  'MNQ': { name: 'Micro E-mini NASDAQ', category: 'Micro Equity Indices', emoji: '💻', color: 0x0099ff, full: 'NQ', description: 'Micro NASDAQ' },
  'M2K': { name: 'Micro E-mini Russell', category: 'Micro Equity Indices', emoji: '🏢', color: 0xff9900, full: 'RTY', description: 'Micro Russell 2000' },
  'MYM': { name: 'Micro E-mini Dow', category: 'Micro Equity Indices', emoji: '🏭', color: 0x0066cc, full: 'YM', description: 'Micro Dow Jones' },
  
  // Energy - Full Size
  'CL': { name: 'Crude Oil WTI', category: 'Energy', emoji: '🛢️', color: 0x000000, micro: 'MCL', description: 'West Texas Intermediate' },
  'NG': { name: 'Natural Gas', category: 'Energy', emoji: '⚡', color: 0x0066ff, micro: null, description: 'Henry Hub Natural Gas' },
  'RB': { name: 'RBOB Gasoline', category: 'Energy', emoji: '⛽', color: 0xff4500, micro: null, description: 'Reformulated Gasoline' },
  
  // Energy - Micro Size
  'MCL': { name: 'Micro Crude Oil', category: 'Micro Energy', emoji: '🛢️', color: 0x000000, full: 'CL', description: 'Micro WTI Crude' },
  
  // Metals - Full Size
  'GC': { name: 'Gold', category: 'Metals', emoji: '🥇', color: 0xffd700, micro: 'MGC', description: 'Precious Metal' },
  'SI': { name: 'Silver', category: 'Metals', emoji: '🥈', color: 0xc0c0c0, micro: 'SIL', description: 'Industrial Precious Metal' },
  'HG': { name: 'Copper', category: 'Metals', emoji: '🔶', color: 0xb87333, micro: null, description: 'Industrial Metal' },
  'PL': { name: 'Platinum', category: 'Metals', emoji: '⚪', color: 0xe5e4e2, micro: null, description: 'Automotive Catalyst' },
  
  // Metals - Micro Size
  'MGC': { name: 'Micro Gold', category: 'Micro Metals', emoji: '🥇', color: 0xffd700, full: 'GC', description: 'Micro Gold Futures' },
  'SIL': { name: 'Micro Silver', category: 'Micro Metals', emoji: '🥈', color: 0xc0c0c0, full: 'SI', description: 'Micro Silver Futures' },
  
  // Grains & Agriculture
  'ZC': { name: 'Corn', category: 'Agriculture', emoji: '🌽', color: 0xffff00, micro: 'XC', description: 'Feed Grain & Ethanol' },
  'ZS': { name: 'Soybeans', category: 'Agriculture', emoji: '🌱', color: 0x90ee90, micro: 'XK', description: 'Protein & Oil Source' },
  'ZW': { name: 'Wheat', category: 'Agriculture', emoji: '🌾', color: 0xdaa520, micro: 'XW', description: 'Food Grain' },
  'ZM': { name: 'Soybean Meal', category: 'Agriculture', emoji: '🥜', color: 0x8b4513, micro: null, description: 'Protein Feed' },
  'ZL': { name: 'Soybean Oil', category: 'Agriculture', emoji: '🫒', color: 0x9acd32, micro: null, description: 'Cooking Oil & Biodiesel' },
  
  // Grains - Micro Size
  'XC': { name: 'Micro Corn', category: 'Micro Agriculture', emoji: '🌽', color: 0xffff00, full: 'ZC', description: 'Micro Corn Futures' },
  'XK': { name: 'Micro Soybeans', category: 'Micro Agriculture', emoji: '🌱', color: 0x90ee90, full: 'ZS', description: 'Micro Soybean Futures' },
  'XW': { name: 'Micro Wheat', category: 'Micro Agriculture', emoji: '🌾', color: 0xdaa520, full: 'ZW', description: 'Micro Wheat Futures' },
  
  // Softs
  'KC': { name: 'Coffee', category: 'Softs', emoji: '☕', color: 0x8b4513, micro: null, description: 'Arabica Coffee Beans' },
  'SB': { name: 'Sugar', category: 'Softs', emoji: '🍯', color: 0xffd700, micro: null, description: 'Raw Sugar #11' },
  'CT': { name: 'Cotton', category: 'Softs', emoji: '🤍', color: 0xf5f5dc, micro: null, description: 'Cotton #2' },
  'CC': { name: 'Cocoa', category: 'Softs', emoji: '🍫', color: 0x8b4513, micro: null, description: 'Cocoa Beans' },
  
  // Livestock
  'LC': { name: 'Live Cattle', category: 'Livestock', emoji: '🐄', color: 0x8b4513, micro: null, description: 'Beef Cattle' },
  'LH': { name: 'Lean Hogs', category: 'Livestock', emoji: '🐷', color: 0xffc0cb, micro: null, description: 'Pork Bellies' },
  
  // Bonds - Full Size
  'ZN': { name: '10-Year Treasury Note', category: 'Bonds', emoji: '📊', color: 0x4169e1, micro: '10Y', description: 'US Government Bond' },
  'ZB': { name: '30-Year Treasury Bond', category: 'Bonds', emoji: '📈', color: 0x191970, micro: null, description: 'Long Duration Bond' },
  'ZF': { name: '5-Year Treasury Note', category: 'Bonds', emoji: '📉', color: 0x6495ed, micro: '5YY', description: 'Medium Duration Bond' },
  'ZT': { name: '2-Year Treasury Note', category: 'Bonds', emoji: '📋', color: 0x87ceeb, micro: '2YY', description: 'Short Duration Bond' },
  
  // Bonds - Micro Size
  '10Y': { name: 'Micro 10-Year Treasury', category: 'Micro Bonds', emoji: '📊', color: 0x4169e1, full: 'ZN', description: 'Micro 10-Year Note' },
  '5YY': { name: 'Micro 5-Year Treasury', category: 'Micro Bonds', emoji: '📉', color: 0x6495ed, full: 'ZF', description: 'Micro 5-Year Note' },
  '2YY': { name: 'Micro 2-Year Treasury', category: 'Micro Bonds', emoji: '📋', color: 0x87ceeb, full: 'ZT', description: 'Micro 2-Year Note' },
  
  // Currencies - Full Size
  'EUR': { name: 'Euro FX', category: 'Currencies', emoji: '🇪🇺', color: 0x003399, micro: 'E7', description: 'EUR/USD Exchange Rate' },
  'JPY': { name: 'Japanese Yen', category: 'Currencies', emoji: '🇯🇵', color: 0xff0000, micro: 'J7', description: 'USD/JPY Exchange Rate' },
  'GBP': { name: 'British Pound', category: 'Currencies', emoji: '🇬🇧', color: 0x012169, micro: null, description: 'GBP/USD Exchange Rate' },
  'CAD': { name: 'Canadian Dollar', category: 'Currencies', emoji: '🇨🇦', color: 0xff0000, micro: null, description: 'USD/CAD Exchange Rate' },
  'AUD': { name: 'Australian Dollar', category: 'Currencies', emoji: '🇦🇺', color: 0x00008b, micro: null, description: 'AUD/USD Exchange Rate' },
  'CHF': { name: 'Swiss Franc', category: 'Currencies', emoji: '🇨🇭', color: 0xdc143c, micro: null, description: 'USD/CHF Exchange Rate' },
  
  // Currencies - Micro Size
  'E7': { name: 'Micro Euro FX', category: 'Micro Currencies', emoji: '🇪🇺', color: 0x003399, full: 'EUR', description: 'Micro EUR/USD' },
  'J7': { name: 'Micro Japanese Yen', category: 'Micro Currencies', emoji: '🇯🇵', color: 0xff0000, full: 'JPY', description: 'Micro USD/JPY' },
  
  // Volatility
  'VX': { name: 'VIX Futures', category: 'Volatility', emoji: '📉', color: 0xff0000, micro: null, description: 'CBOE Volatility Index' },
  
  // Crypto - Full Size
  'BTC': { name: 'Bitcoin', category: 'Crypto', emoji: '₿', color: 0xf7931a, micro: 'MBT', description: 'Digital Gold' },
  'ETH': { name: 'Ethereum', category: 'Crypto', emoji: '⟠', color: 0x627eea, micro: 'MET', description: 'Smart Contract Platform' },
  
  // Crypto - Micro Size
  'MBT': { name: 'Micro Bitcoin', category: 'Micro Crypto', emoji: '₿', color: 0xf7931a, full: 'BTC', description: 'Micro Bitcoin Futures' },
  'MET': { name: 'Micro Ethereum', category: 'Micro Crypto', emoji: '⟠', color: 0x627eea, full: 'ETH', description: 'Micro Ethereum Futures' }
}

// Professional message formatting with micro contract support
export function formatTradingSignal(symbol: string, signal: any) {
  const metadata = SYMBOL_METADATA[symbol as keyof typeof SYMBOL_METADATA]
  
  if (!metadata) {
    console.error(`No metadata found for symbol: ${symbol}`)
    return {
      embeds: [{
        title: `${symbol} Signal`,
        description: `**${signal.action?.toUpperCase() || 'SIGNAL'}** - ${signal.reasoning || 'Advanced analytics signal'}`,
        color: 0x808080,
        timestamp: new Date().toISOString()
      }]
    }
  }

  // Calculate professional profit targets if not provided
  const entry = parseFloat(signal.entry) || 0
  const stopLoss = parseFloat(signal.stopLoss) || 0
  const riskPoints = Math.abs(entry - stopLoss)
  
  // Professional target calculation (1R, 2R, 3R)
  const targets = signal.targets || []
  let target1, target2, target3
  
  if (targets.length >= 3) {
    target1 = parseFloat(targets[0])
    target2 = parseFloat(targets[1]) 
    target3 = parseFloat(targets[2])
  } else {
    // Calculate targets based on risk/reward ratios
    const direction = signal.direction?.toUpperCase()
    if (direction === 'LONG') {
      target1 = entry + (riskPoints * 1.5) // 1.5R
      target2 = entry + (riskPoints * 2.5) // 2.5R
      target3 = entry + (riskPoints * 3.5) // 3.5R
    } else {
      target1 = entry - (riskPoints * 1.5) // 1.5R
      target2 = entry - (riskPoints * 2.5) // 2.5R
      target3 = entry - (riskPoints * 3.5) // 3.5R
    }
  }

  // Calculate breakeven point (50% to T1)
  const breakevenDistance = Math.abs(target1 - entry) * 0.5
  const breakeven = signal.direction?.toUpperCase() === 'LONG' 
    ? entry + breakevenDistance 
    : entry - breakevenDistance

  // Build contract size information
  let contractInfo = ''
  if ('micro' in metadata && metadata.micro) {
    contractInfo = `\n**Micro Version:** ${metadata.micro} available`
  } else if ('full' in metadata && metadata.full) {
    contractInfo = `\n**Full Size:** ${metadata.full} available`
  }

  // Professional profit targets display
  const profitTargets = `**T1 (1.5R):** $${target1.toFixed(2)} - Take 1/3 profit\n**T2 (2.5R):** $${target2.toFixed(2)} - Take 1/2 remaining\n**T3 (3.5R):** $${target3.toFixed(2)} - Take final profit`

  // Professional risk management plan
  const riskPlan = `**Stop Loss:** $${stopLoss.toFixed(2)}\n**Breakeven:** $${breakeven.toFixed(2)} (Move at 50% to T1)\n**Position Size:** 0.5% (Professional Standard)`

  return {
    embeds: [{
      title: `${metadata.emoji} ${metadata.name} (${symbol}) - ${signal.direction?.toUpperCase() || 'SIGNAL'}`,
      description: `**${signal.action?.toUpperCase() || 'SIGNAL'}** - ${metadata.description}\n\n${signal.reasoning || 'Professional trading signal with automated position management'}`,
      color: metadata.color,
      fields: [
        {
          name: '📊 Entry Details',
          value: `**Direction:** ${signal.direction?.toUpperCase() || 'N/A'}\n**Confidence:** ${signal.confidence || '85'}%\n**Entry:** $${entry.toFixed(2)}${contractInfo}`,
          inline: true
        },
        {
          name: '⚖️ Risk Management',
          value: riskPlan,
          inline: true
        },
        {
          name: '🎯 Profit Targets',
          value: profitTargets,
          inline: false
        },
        {
          name: '📈 Position Management',
          value: `**Scale Out:** 1/3 at each target\n**Trail Stop:** After T1 hit\n**Auto Management:** Enabled`,
          inline: true
        },
        {
          name: `${metadata.emoji} Market Info`,
          value: `**Category:** ${metadata.category}\n**Risk/Reward:** 1:2.5 minimum\n**Symbol:** ${symbol}`,
          inline: true
        }
      ],
      footer: {
        text: `${metadata.name} • Nexural Trading System • Automated Position Management • ${new Date().toLocaleString()}`,
        icon_url: 'https://example.com/logo.png'
      },
      timestamp: new Date().toISOString()
    }]
  }
}

// Send signal to Discord
export async function sendDiscordSignal(symbol: string, signal: any) {
  const webhookUrl = DISCORD_WEBHOOKS[symbol as keyof typeof DISCORD_WEBHOOKS]
  
  if (!webhookUrl) {
    console.error(`No webhook URL found for symbol: ${symbol}`)
    return false
  }

  try {
    const message = formatTradingSignal(symbol, signal)
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    })

    if (response.ok) {
      console.log(`✅ Signal sent successfully to ${symbol} channel`)
      return true
    } else {
      console.error(`❌ Failed to send signal to ${symbol}: ${response.status}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error sending signal to ${symbol}:`, error)
    return false
  }
}

// Test all webhooks with professional signal formatting
export async function testAllWebhooks() {
  const results = []
  
  for (const [symbol, webhookUrl] of Object.entries(DISCORD_WEBHOOKS)) {
    if (!webhookUrl) continue
    
    // Professional test signal with realistic prices
    const basePrice = getBasePrice(symbol)
    const testSignal = {
      action: 'PROFESSIONAL_TEST',
      direction: 'LONG',
      confidence: 85,
      entry: basePrice,
      stopLoss: basePrice * 0.985, // 1.5% stop loss
      targets: [
        basePrice * 1.0225, // 2.25% target 1 (1.5R)
        basePrice * 1.0375, // 3.75% target 2 (2.5R) 
        basePrice * 1.0525  // 5.25% target 3 (3.5R)
      ],
      reasoning: 'Nexural trading signal with automated position management'
    }
    
    const success = await sendDiscordSignal(symbol, testSignal)
    results.push({ symbol, success, webhookUrl: webhookUrl ? 'Configured' : 'Missing' })
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}

// Get realistic base price for testing
function getBasePrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'ES': 4500.00,
    'NQ': 15000.00,
    'RTY': 2000.00,
    'YM': 35000.00,
    'CL': 75.00,
    'GC': 2000.00,
    'SI': 25.00,
    'BTC': 45000.00,
    'ETH': 2500.00,
    'ZN': 110.00,
    'EUR': 1.0800,
    'JPY': 150.00,
    'NG': 3.50,
    'HG': 4.00,
    'ZC': 450.00,
    'ZS': 1200.00,
    'ZW': 600.00,
    'VX': 15.00,      // VIX Futures
    'AUD': 0.6700,    // Australian Dollar
    'CAD': 1.3500,    // Canadian Dollar
    'CHF': 0.9200     // Swiss Franc
  }
  
  return basePrices[symbol] || 100.00
}

// Get all configured symbols
export function getAllSymbols() {
  return Object.keys(DISCORD_WEBHOOKS).filter(symbol => DISCORD_WEBHOOKS[symbol as keyof typeof DISCORD_WEBHOOKS])
}

// Portfolio analytics
export function getPortfolioBreakdown() {
  const symbols = getAllSymbols()
  const breakdown = {
    total: symbols.length,
    categories: {} as Record<string, number>,
    symbols: symbols
  }
  
  symbols.forEach(symbol => {
    const metadata = SYMBOL_METADATA[symbol as keyof typeof SYMBOL_METADATA]
    if (metadata) {
      breakdown.categories[metadata.category] = (breakdown.categories[metadata.category] || 0) + 1
    }
  })
  
  return breakdown
}
