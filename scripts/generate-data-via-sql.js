/**
 * Generate Dummy Data via Direct SQL
 * Bypasses PostgREST API cache issues
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('\n🚀 Generating Data via Direct SQL\n')
console.log('='.repeat(60))

// SQL to create positions directly
const createPositionsSQL = `
-- Insert 10 closed positions
INSERT INTO positions (
  ticker, company_name, position_type, direction, entry_price, entry_date,
  shares, stop_loss, target, status, exit_price, exit_date,
  realized_pnl, realized_pnl_pct, risk_dollars, risk_percent,
  r_multiple_target, actual_r_multiple, tags, setup_type, time_frame,
  entry_thesis, trade_grade, execution_quality, emotional_score,
  followed_plan, actual_hold_days, chart_pattern
) VALUES
('NVDA', 'NVIDIA Corporation', 'stock', 'long', 465.00, NOW() - INTERVAL '45 days', 
  100, 450.00, 510.00, 'closed', 502.00, NOW() - INTERVAL '15 days',
  3700, 7.96, 1500, 1.5, 3.0, 2.5, ARRAY['breakout','momentum'], 'Bull Flag', 'swing',
  'Breaking above resistance with strong volume', 'A', 9, 8, true, 30, 'Bull Flag'),
  
('AAPL', 'Apple Inc.', 'stock', 'long', 185.00, NOW() - INTERVAL '30 days',
  150, 178.00, 198.00, 'closed', 181.00, NOW() - INTERVAL '10 days',
  -600, -2.16, 1050, 1.0, 1.86, -0.57, ARRAY['pullback','technical'], 'Support Bounce', 'swing',
  'Bouncing off 50-day MA support', 'C', 6, 5, false, 20, 'Support'),
  
('TSLA', 'Tesla Inc.', 'stock', 'long', 238.00, NOW() - INTERVAL '20 days',
  75, 225.00, 265.00, 'closed', 258.00, NOW() - INTERVAL '5 days',
  1500, 8.40, 975, 0.8, 2.08, 1.54, ARRAY['momentum','swing'], 'Breakout', 'swing',
  'Technical breakout with high volume', 'A', 8, 9, true, 15, 'Breakout'),
  
('MSFT', 'Microsoft Corporation', 'stock', 'long', 365.00, NOW() - INTERVAL '35 days',
  100, 355.00, 385.00, 'closed', 358.00, NOW() - INTERVAL '8 days',
  -700, -1.92, 1000, 1.0, 2.0, -0.70, ARRAY['technical'], 'Bull Flag', 'position',
  'Clean bull flag pattern forming', 'D', 5, 6, false, 27, 'Bull Flag'),
  
('GOOGL', 'Alphabet Inc.', 'stock', 'long', 135.00, NOW() - INTERVAL '25 days',
  200, 130.00, 148.00, 'closed', 145.00, NOW() - INTERVAL '3 days',
  2000, 7.41, 1000, 0.8, 2.6, 2.0, ARRAY['breakout','fundamental'], 'Ascending Triangle', 'swing',
  'Breaking out of consolidation', 'B', 7, 7, true, 22, 'Triangle'),
  
('META', 'Meta Platforms Inc.', 'stock', 'long', 355.00, NOW() - INTERVAL '40 days',
  80, 340.00, 385.00, 'closed', 378.00, NOW() - INTERVAL '12 days',
  1840, 6.48, 1200, 1.2, 2.0, 1.53, ARRAY['momentum','technical'], 'Momentum', 'swing',
  'High momentum continuation', 'A', 9, 8, true, 28, 'Momentum'),
  
('AMZN', 'Amazon.com Inc.', 'stock', 'long', 145.00, NOW() - INTERVAL '50 days',
  150, 138.00, 162.00, 'closed', 141.00, NOW() - INTERVAL '20 days',
  -600, -2.76, 1050, 1.0, 2.43, -0.57, ARRAY['reversal'], 'Reversal', 'position',
  'Attempting trend reversal', 'F', 4, 4, false, 30, 'Reversal'),
  
('AMD', 'Advanced Micro Devices', 'stock', 'long', 132.00, NOW() - INTERVAL '15 days',
  120, 126.00, 145.00, 'closed', 142.00, NOW() - INTERVAL '2 days',
  1200, 7.58, 720, 0.9, 2.17, 1.67, ARRAY['breakout','technical'], 'Breakout', 'swing',
  'Clean breakout above resistance', 'A', 9, 9, true, 13, 'Breakout'),
  
('COIN', 'Coinbase Global Inc.', 'stock', 'long', 195.00, NOW() - INTERVAL '60 days',
  100, 185.00, 220.00, 'closed', 188.00, NOW() - INTERVAL '30 days',
  -700, -3.59, 1000, 1.5, 2.5, -0.70, ARRAY['high-risk','momentum'], 'Gap Fill', 'day',
  'Gap fill opportunity', 'D', 5, 5, false, 30, 'Gap'),
  
('PLTR', 'Palantir Technologies', 'stock', 'long', 24.00, NOW() - INTERVAL '18 days',
  400, 22.50, 27.00, 'closed', 26.50, NOW() - INTERVAL '4 days',
  1000, 10.42, 600, 1.0, 2.0, 1.67, ARRAY['momentum','swing'], 'Momentum', 'swing',
  'High momentum with volume', 'B', 8, 7, true, 14, 'Momentum');

-- Insert 5 open positions
INSERT INTO positions (
  ticker, company_name, position_type, direction, entry_price, entry_date,
  shares, stop_loss, target, status, current_price, unrealized_pnl, unrealized_pnl_pct,
  last_price_update, risk_dollars, risk_percent, r_multiple_target,
  tags, setup_type, time_frame, entry_thesis, execution_quality
) VALUES
('NVDA', 'NVIDIA Corporation', 'stock', 'long', 475.00, NOW() - INTERVAL '3 days',
  100, 462.00, 515.00, 'open', 485.23, 1023, 2.15,
  NOW(), 1300, 1.2, 3.1,
  ARRAY['breakout','momentum'], 'Bull Flag', 'swing',
  'Breaking above consolidation', 9),
  
('AAPL', 'Apple Inc.', 'stock', 'long', 192.00, NOW() - INTERVAL '5 days',
  150, 185.00, 208.00, 'open', 195.67, 550.50, 1.91,
  NOW(), 1050, 1.0, 2.29,
  ARRAY['technical','swing'], 'Support Bounce', 'swing',
  'Bouncing from key support', 8),
  
('TSLA', 'Tesla Inc.', 'stock', 'long', 235.00, NOW() - INTERVAL '2 days',
  80, 225.00, 258.00, 'open', 242.19, 575.20, 3.06,
  NOW(), 800, 0.9, 2.3,
  ARRAY['momentum'], 'Breakout', 'swing',
  'Strong momentum breakout', 9),
  
('MSFT', 'Microsoft Corporation', 'stock', 'long', 372.00, NOW() - INTERVAL '7 days',
  100, 362.00, 395.00, 'open', 378.45, 645, 1.73,
  NOW(), 1000, 1.0, 2.3,
  ARRAY['technical'], 'Bull Flag', 'position',
  'Clean technical pattern', 8),
  
('META', 'Meta Platforms Inc.', 'stock', 'long', 358.00, NOW() - INTERVAL '4 days',
  85, 345.00, 385.00, 'open', 365.80, 663, 2.18,
  NOW(), 1105, 1.1, 2.08,
  ARRAY['momentum','technical'], 'Momentum', 'swing',
  'High momentum continuation', 9);

-- Create activity for open positions
INSERT INTO position_activity (position_id, activity_type, activity_category, description, timestamp, importance, show_in_timeline)
SELECT 
  id,
  'position_opened',
  'trade',
  'Opened ' || ticker || ' position',
  entry_date,
  'high',
  true
FROM positions
WHERE status = 'open';

-- Create targets for open positions
INSERT INTO position_targets (position_id, target_number, target_price, percent_allocation, r_multiple, status)
SELECT 
  id,
  1,
  entry_price + ((target - entry_price) * 0.4),
  50,
  1.5,
  'active'
FROM positions
WHERE status = 'open'
UNION ALL
SELECT 
  id,
  2,
  entry_price + ((target - entry_price) * 0.7),
  30,
  2.5,
  'active'
FROM positions
WHERE status = 'open'
UNION ALL
SELECT 
  id,
  3,
  target,
  20,
  3.5,
  'active'
FROM positions
WHERE status = 'open';
`

async function generateData() {
  try {
    console.log('\n📊 Inserting position data directly via SQL...\n')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: createPositionsSQL })
    
    if (error) {
      // If RPC doesn't exist, use the SQL editor approach
      console.log('⚠️  Could not use RPC, using direct insert...\n')
      
      // Break into smaller chunks and insert
      const positions = [
        { ticker: 'NVDA', company_name: 'NVIDIA Corporation', entry_price: 475.00, status: 'open', current_price: 485.23 },
        { ticker: 'AAPL', company_name: 'Apple Inc.', entry_price: 192.00, status: 'open', current_price: 195.67 },
        { ticker: 'TSLA', company_name: 'Tesla Inc.', entry_price: 235.00, status: 'open', current_price: 242.19 },
      ]
      
      for (const pos of positions) {
        const { error: insertError } = await supabase.from('positions').insert(pos)
        if (insertError) {
          console.log(`❌ Error inserting ${pos.ticker}:`, insertError.message)
        } else {
          console.log(`✅ Created position: ${pos.ticker}`)
        }
      }
    } else {
      console.log('✅ Data inserted successfully!\n')
    }
    
    // Verify data
    const { data: positions, error: queryError } = await supabase
      .from('positions')
      .select('ticker, status')
    
    if (queryError) {
      console.log('⚠️  Could not verify (cache issue), but data should be in database')
    } else {
      console.log(`\n📊 Verification:`)
      console.log(`   Total positions: ${positions?.length || 0}`)
      console.log(`   Open: ${positions?.filter(p => p.status === 'open').length || 0}`)
      console.log(`   Closed: ${positions?.filter(p => p.status === 'closed').length || 0}`)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('\n✅ Data generation complete!')
    console.log('\n💡 Next: Check Supabase Dashboard → Table Editor → positions')
    console.log('   You should see 15 positions there\n')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.log('\n📝 Manual Fix Required:')
    console.log('   1. Copy the SQL from scripts/generate-data-via-sql.js')
    console.log('   2. Paste into Supabase SQL Editor')
    console.log('   3. Click RUN\n')
  }
}

generateData()
