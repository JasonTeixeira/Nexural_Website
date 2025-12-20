/**
 * Dummy Position Data Generator - JavaScript Version
 * 
 * Generates realistic test data for the position management system
 * Run: node scripts/generate-dummy-positions.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Sample tickers
const TICKERS = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 485 },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 195 },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 242 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', price: 378 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 142 },
  { ticker: 'META', name: 'Meta Platforms Inc.', price: 365 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 152 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 138 },
  { ticker: 'COIN', name: 'Coinbase Global Inc.', price: 205 },
  { ticker: 'PLTR', name: 'Palantir Technologies', price: 28 },
  { ticker: 'SHOP', name: 'Shopify Inc.', price: 78 },
  { ticker: 'SQ', name: 'Block Inc.', price: 65 },
  { ticker: 'ROKU', name: 'Roku Inc.', price: 75 },
  { ticker: 'SNAP', name: 'Snap Inc.', price: 11 },
  { ticker: 'UBER', name: 'Uber Technologies', price: 62 },
]

const SETUP_TYPES = [
  'Bull Flag', 'Support Bounce', 'Breakout', 'Pullback to MA',
  'Head & Shoulders', 'Double Bottom', 'Ascending Triangle',
  'Cup and Handle', 'Gap Fill', 'Momentum'
]

const TAGS = [
  ['breakout', 'momentum'],
  ['pullback', 'technical'],
  ['earnings', 'high-risk'],
  ['support', 'low-risk'],
  ['reversal', 'technical'],
  ['sector-rotation', 'swing'],
  ['technical', 'day-trade'],
  ['fundamental', 'position'],
]

const MARKET_CONDITIONS = [
  'Bull market - Strong trend',
  'Bear market - Downtrend',
  'Choppy - Range bound',
  'High volatility',
  'Low volatility',
  'Rotation into tech',
  'Risk-on environment',
]

const THESES = [
  'Breaking above key resistance after consolidation. Strong volume. Targets overhead gap fill.',
  'Bouncing off 50-day MA with RSI oversold. Sector showing strength. Risk:reward favors entry.',
  'Earnings beat expectations. Guidance raised. Momentum likely to continue. Gap up entry.',
  'Double bottom pattern completed. Volume increasing. Looking for continuation to $X.',
  'Pullback to support in strong uptrend. Trend remains intact. Adding on weakness.',
  'Sector rotation play. Money flowing into tech. Position for multi-week move.',
  'Technical breakout from multi-month base. High tight flag pattern. Momentum building.',
  'Gap up on news. Looking for follow-through. Stop below opening price.',
]

const EXIT_REASONS = [
  'Target reached - Taking profits as planned',
  'Stop loss hit - Cut losses quickly',
  'Market conditions changed - Risk off',
  'Better opportunity elsewhere - Portfolio reallocation',
  'Time-based exit - Held long enough',
  'Broke key support - Trend violated',
]

const LESSONS = [
  'Entry timing was excellent. Waited for confirmation.',
  'Should have sized smaller given volatility.',
  'Stop was too tight. Got shaken out before move.',
  'Perfect execution. Followed plan exactly.',
  'Risk management was on point. Small loss.',
  'Scaling out at targets worked perfectly.',
]

const MISTAKES = [
  'Sized too large for the setup',
  'Didn\'t wait for confirmation',
  'Moved stop too soon',
  'Failed to take profits at T1',
  'Ignored the larger trend',
]

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDecimal(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

async function generateClosedPosition(ticker) {
  const isWinner = Math.random() > 0.35 // 65% win rate
  const direction = 'long'
  const entryPrice = randomDecimal(ticker.price * 0.8, ticker.price * 1.2)
  const shares = randomInt(10, 200)
  const daysHeld = randomInt(1, 30)
  const entryDate = daysAgo(daysHeld + randomInt(5, 60))
  
  const rMultiple = isWinner ? randomDecimal(0.5, 5.0) : randomDecimal(-1.0, -0.2)
  const stopDistance = entryPrice * randomDecimal(0.02, 0.08)
  const exitPrice = entryPrice + (stopDistance * rMultiple)
  const realizedPnl = (exitPrice - entryPrice) * shares
  
  const stopLoss = entryPrice - stopDistance
  const target = entryPrice + (stopDistance * randomDecimal(2.0, 5.0))
  
  const position = {
    ticker: ticker.ticker,
    company_name: ticker.name,
    position_type: 'stock',
    direction,
    entry_price: entryPrice,
    entry_date: entryDate.toISOString(),
    shares,
    stop_loss: stopLoss,
    target,
    status: 'closed',
    exit_price: exitPrice,
    exit_date: daysAgo(randomInt(0, 5)).toISOString(),
    realized_pnl: realizedPnl,
    realized_pnl_pct: ((exitPrice - entryPrice) / entryPrice * 100),
    risk_dollars: stopDistance * shares,
    risk_percent: randomDecimal(0.5, 3.0),
    position_size_percent: randomDecimal(5, 20),
    r_multiple_target: randomDecimal(2.0, 5.0),
    actual_r_multiple: rMultiple,
    tags: randomElement(TAGS),
    setup_type: randomElement(SETUP_TYPES),
    time_frame: randomElement(['day', 'swing', 'position']),
    catalyst: Math.random() > 0.5 ? randomElement(['Earnings', 'Breakout', 'News']) : null,
    market_conditions: randomElement(MARKET_CONDITIONS),
    entry_thesis: randomElement(THESES),
    exit_plan: `Target: $${target.toFixed(2)} | Stop: $${stopLoss.toFixed(2)}`,
    exit_reason: randomElement(EXIT_REASONS),
    trade_grade: isWinner ? randomElement(['A+', 'A', 'B']) : randomElement(['C', 'D', 'F']),
    execution_quality: isWinner ? randomInt(7, 10) : randomInt(3, 7),
    emotional_score: randomInt(5, 9),
    followed_plan: isWinner ? (Math.random() > 0.2) : (Math.random() > 0.6),
    lessons_learned: randomElement(LESSONS),
    mistakes_made: isWinner ? null : randomElement(MISTAKES),
    actual_hold_days: daysHeld,
    expected_hold_days: randomInt(3, 14),
    chart_pattern: randomElement(['Bull Flag', 'Triangle', 'H&S', 'Double Bottom']),
    support_level: entryPrice * 0.95,
    resistance_level: entryPrice * 1.10,
  }
  
  const { data, error } = await supabase
    .from('positions')
    .insert(position)
    .select()
    .single()
  
  if (error) {
    console.error(`Error creating closed position ${ticker.ticker}:`, error)
    return null
  }
  
  console.log(`✅ Created closed position: ${ticker.ticker} ${isWinner ? '(WIN)' : '(LOSS)'} ${rMultiple.toFixed(2)}R`)
  
  await addActivityHistory(data.id, ticker.ticker, entryDate, daysHeld, isWinner)
  
  if (Math.random() > 0.5) {
    await addNote(data.id, 'Strong setup - high conviction')
  }
  
  return data
}

async function generateOpenPosition(ticker) {
  const direction = 'long'
  const entryPrice = randomDecimal(ticker.price * 0.85, ticker.price * 0.95)
  const currentPrice = ticker.price
  const shares = randomInt(10, 150)
  const daysHeld = randomInt(1, 15)
  const entryDate = daysAgo(daysHeld)
  
  const stopDistance = entryPrice * randomDecimal(0.02, 0.06)
  const stopLoss = entryPrice - stopDistance
  const target = entryPrice + (stopDistance * randomDecimal(2.5, 4.0))
  
  const unrealizedPnl = (currentPrice - entryPrice) * shares
  const unrealizedPnlPct = ((currentPrice - entryPrice) / entryPrice * 100)
  
  const position = {
    ticker: ticker.ticker,
    company_name: ticker.name,
    position_type: 'stock',
    direction,
    entry_price: entryPrice,
    entry_date: entryDate.toISOString(),
    shares,
    stop_loss: stopLoss,
    target,
    status: 'open',
    current_price: currentPrice,
    unrealized_pnl: unrealizedPnl,
    unrealized_pnl_pct: unrealizedPnlPct,
    last_price_update: new Date().toISOString(),
    risk_dollars: stopDistance * shares,
    risk_percent: randomDecimal(0.5, 2.5),
    position_size_percent: randomDecimal(5, 15),
    r_multiple_target: randomDecimal(2.5, 4.0),
    tags: randomElement(TAGS),
    setup_type: randomElement(SETUP_TYPES),
    time_frame: 'swing',
    catalyst: Math.random() > 0.5 ? randomElement(['Earnings', 'Breakout']) : null,
    market_conditions: randomElement(MARKET_CONDITIONS),
    entry_thesis: randomElement(THESES),
    exit_plan: `Target: $${target.toFixed(2)} | Stop: $${stopLoss.toFixed(2)}`,
    execution_quality: randomInt(7, 10),
    expected_hold_days: randomInt(5, 20),
    expected_exit_date: daysAgo(-randomInt(5, 15)).toISOString().split('T')[0],
    chart_pattern: randomElement(['Bull Flag', 'Ascending Triangle', 'Breakout']),
    support_level: stopLoss,
    resistance_level: target,
  }
  
  const { data, error } = await supabase
    .from('positions')
    .insert(position)
    .select()
    .single()
  
  if (error) {
    console.error(`Error creating open position ${ticker.ticker}:`, error)
    return null
  }
  
  console.log(`✅ Created open position: ${ticker.ticker} ${unrealizedPnlPct > 0 ? '📈' : '📉'} ${unrealizedPnlPct.toFixed(1)}%`)
  
  await addActivityHistory(data.id, ticker.ticker, entryDate, daysHeld, null, true)
  await addTargets(data.id, entryPrice, target)
  
  if (Math.random() > 0.3) {
    await addNote(data.id, 'Position moving as expected')
  }
  
  return data
}

async function addActivityHistory(positionId, ticker, entryDate, daysHeld, isWinner, isOpen = false) {
  const activities = []
  
  activities.push({
    position_id: positionId,
    activity_type: 'position_opened',
    activity_category: 'trade',
    description: `Opened ${ticker} position`,
    timestamp: entryDate.toISOString(),
    show_in_timeline: true,
    importance: 'high',
  })
  
  const numActivities = randomInt(2, 5)
  for (let i = 0; i < numActivities; i++) {
    const dayOffset = Math.floor((daysHeld / numActivities) * i) + randomInt(1, 3)
    const activityDate = new Date(entryDate)
    activityDate.setDate(activityDate.getDate() + dayOffset)
    
    const activityType = randomElement(['stop_moved', 'note_added', 'price_alert'])
    
    activities.push({
      position_id: positionId,
      activity_type: activityType,
      activity_category: activityType === 'stop_moved' ? 'risk' : 'analysis',
      description: activityType === 'stop_moved' ? 'Stop loss adjusted (trailing)' : 'Added trading note',
      timestamp: activityDate.toISOString(),
      show_in_timeline: true,
      importance: 'normal',
    })
  }
  
  if (!isOpen) {
    const exitDate = new Date(entryDate)
    exitDate.setDate(exitDate.getDate() + daysHeld)
    
    activities.push({
      position_id: positionId,
      activity_type: 'position_closed',
      activity_category: 'trade',
      description: `Closed ${ticker} position - ${isWinner ? 'Profit taken' : 'Stop hit'}`,
      timestamp: exitDate.toISOString(),
      show_in_timeline: true,
      importance: 'high',
    })
  }
  
  const { error } = await supabase.from('position_activity').insert(activities)
  if (error) console.error('Error adding activity:', error)
}

async function addTargets(positionId, entryPrice, finalTarget) {
  const targets = [
    {
      position_id: positionId,
      target_number: 1,
      target_price: entryPrice + ((finalTarget - entryPrice) * 0.4),
      percent_allocation: 50,
      r_multiple: 1.5,
      status: 'active',
    },
    {
      position_id: positionId,
      target_number: 2,
      target_price: entryPrice + ((finalTarget - entryPrice) * 0.7),
      percent_allocation: 30,
      r_multiple: 2.5,
      status: 'active',
    },
    {
      position_id: positionId,
      target_number: 3,
      target_price: finalTarget,
      percent_allocation: 20,
      r_multiple: 3.5,
      status: 'active',
    },
  ]
  
  const { error } = await supabase.from('position_targets').insert(targets)
  if (error) console.error('Error adding targets:', error)
}

async function addNote(positionId, content) {
  const { error } = await supabase.from('position_notes').insert({
    position_id: positionId,
    note_type: 'observation',
    content,
    importance: 'normal',
    created_at: daysAgo(randomInt(0, 5)).toISOString(),
  })
  if (error) console.error('Error adding note:', error)
}

async function main() {
  console.log('\n🚀 Generating Dummy Position Data\n')
  console.log('='.repeat(60))
  
  console.log('\n📊 Creating 50 closed positions...\n')
  for (let i = 0; i < 50; i++) {
    const ticker = randomElement(TICKERS)
    await generateClosedPosition(ticker)
  }
  
  console.log('\n📈 Creating 10 open positions...\n')
  for (let i = 0; i < 10; i++) {
    const ticker = TICKERS[i]
    await generateOpenPosition(ticker)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('\n✨ Dummy data generation complete!\n')
  console.log('📊 Created:')
  console.log('   - 50 closed positions (wins & losses)')
  console.log('   - 10 open positions')
  console.log('   - Activity timelines')
  console.log('   - Notes and observations')
  console.log('   - Multiple targets per position')
  console.log('\n🎯 Ready to view in admin dashboard!\n')
}

main().catch(console.error)
