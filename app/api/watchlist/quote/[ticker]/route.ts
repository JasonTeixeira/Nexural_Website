import { NextRequest, NextResponse } from 'next/server'

// Alpha Vantage API (Free tier: 5 calls/min, 500/day)
// Sign up at: https://www.alphavantage.co/support/#api-key
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker.toUpperCase()

    // Fetch real-time quote from Alpha Vantage
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
    
    const quoteResponse = await fetch(quoteUrl)
    const quoteData = await quoteResponse.json()

    // Check for API errors
    if (quoteData['Error Message']) {
      return NextResponse.json(
        { error: 'Invalid ticker symbol' },
        { status: 404 }
      )
    }

    if (quoteData['Note']) {
      // API rate limit hit
      return NextResponse.json(
        { error: 'API rate limit reached. Please try again later.' },
        { status: 429 }
      )
    }

    const quote = quoteData['Global Quote']

    if (!quote || Object.keys(quote).length === 0) {
      return NextResponse.json(
        { error: 'No data found for ticker' },
        { status: 404 }
      )
    }

    // Also fetch company overview for additional info
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
    const overviewResponse = await fetch(overviewUrl)
    const overviewData = await overviewResponse.json()

    // Format the response
    const stockData = {
      ticker,
      price: parseFloat(quote['05. price'] || '0'),
      change: parseFloat(quote['09. change'] || '0'),
      changePercent: parseFloat((quote['10. change percent'] || '0').replace('%', '')),
      open: parseFloat(quote['02. open'] || '0'),
      high: parseFloat(quote['03. high'] || '0'),
      low: parseFloat(quote['04. low'] || '0'),
      volume: parseInt(quote['06. volume'] || '0'),
      previousClose: parseFloat(quote['08. previous close'] || '0'),
      latestTradingDay: quote['07. latest trading day'],
      // Company info from overview
      companyName: overviewData.Name || ticker,
      sector: overviewData.Sector || 'N/A',
      industry: overviewData.Industry || 'N/A',
      marketCap: overviewData.MarketCapitalization || 'N/A',
      peRatio: overviewData.PERatio || 'N/A',
      dividendYield: overviewData.DividendYield || 'N/A',
      fiftyTwoWeekHigh: parseFloat(overviewData['52WeekHigh'] || '0'),
      fiftyTwoWeekLow: parseFloat(overviewData['52WeekLow'] || '0'),
    }

    return NextResponse.json({ stockData })
  } catch (error) {
    console.error('Error fetching stock quote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock quote' },
      { status: 500 }
    )
  }
}

// Fallback demo data in case API is not configured
async function getDemoStockData(ticker: string) {
  const demoData: Record<string, any> = {
    AAPL: {
      ticker: 'AAPL',
      price: 182.45,
      change: -2.18,
      changePercent: -1.18,
      open: 184.50,
      high: 185.20,
      low: 181.90,
      volume: 48750000,
      previousClose: 184.63,
      companyName: 'Apple Inc.',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      marketCap: '2800000000000',
      peRatio: '29.5',
      dividendYield: '0.52',
      fiftyTwoWeekHigh: 199.62,
      fiftyTwoWeekLow: 164.08,
    },
    NVDA: {
      ticker: 'NVDA',
      price: 495.23,
      change: 12.05,
      changePercent: 2.49,
      open: 490.00,
      high: 498.50,
      low: 489.20,
      volume: 52300000,
      previousClose: 483.18,
      companyName: 'NVIDIA Corporation',
      sector: 'Technology',
      industry: 'Semiconductors',
      marketCap: '1220000000000',
      peRatio: '68.2',
      dividendYield: '0.03',
      fiftyTwoWeekHigh: 502.66,
      fiftyTwoWeekLow: 108.13,
    },
    TSLA: {
      ticker: 'TSLA',
      price: 245.67,
      change: 10.45,
      changePercent: 4.43,
      open: 240.00,
      high: 247.80,
      low: 239.50,
      volume: 125000000,
      previousClose: 235.22,
      companyName: 'Tesla, Inc.',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      marketCap: '780000000000',
      peRatio: '76.8',
      dividendYield: '0.00',
      fiftyTwoWeekHigh: 299.29,
      fiftyTwoWeekLow: 101.81,
    },
  }

  return demoData[ticker.toUpperCase()] || {
    ticker: ticker.toUpperCase(),
    price: 100 + Math.random() * 50,
    change: -5 + Math.random() * 10,
    changePercent: -2 + Math.random() * 4,
    open: 100,
    high: 105,
    low: 95,
    volume: 1000000,
    previousClose: 100,
    companyName: `${ticker} Company`,
    sector: 'Various',
    industry: 'Various',
    marketCap: 'N/A',
    peRatio: 'N/A',
    dividendYield: 'N/A',
    fiftyTwoWeekHigh: 0,
    fiftyTwoWeekLow: 0,
  }
}
