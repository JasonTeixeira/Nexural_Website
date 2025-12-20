#!/usr/bin/env node

/**
 * Clean up swing_positions table and insert fresh data
 */

const https = require('https');

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkd2J0ZWF5aHZzdGV2Z2xycm54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ4NjUwMCwiZXhwIjoyMDc0MDYyNTAwfQ.SYf6PvmGslDcEXHT8MJ-_bjzXirTcYSgjRfCmh3Vhvo';

console.log('🧹 Cleaning up swing_positions table...\n');

// Step 1: Delete all existing data
const deleteOptions = {
  hostname: 'edwbteayhvstevglrrnx.supabase.co',
  port: 443,
  path: '/rest/v1/swing_positions?id=neq.00000000-0000-0000-0000-000000000000',
  method: 'DELETE',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
  }
};

const deleteReq = https.request(deleteOptions, (res) => {
  console.log(`Delete Status: ${res.statusCode}`);
  
  if (res.statusCode === 204 || res.statusCode === 200) {
    console.log('✅ Old data deleted!\n');
    
    // Step 2: Insert fresh data
    insertFreshData();
  } else {
    console.log('⚠️  Delete response:', res.statusCode);
    insertFreshData();
  }
});

deleteReq.on('error', (error) => {
  console.error('❌ Delete failed:', error.message);
  insertFreshData();
});

deleteReq.end();

function insertFreshData() {
  console.log('📝 Inserting fresh test data...\n');
  
  const insertData = [
    {
      symbol: 'AAPL',
      direction: 'LONG',
      entry_price: 175.50,
      current_price: 180.25,
      stop_loss: 172.00,
      targets: [180.00, 185.00, 190.00],
      targets_hit: [],
      position_size: 100,
      status: 'active',
      pnl: 475.00,
      pnl_percent: 2.71
    },
    {
      symbol: 'TSLA',
      direction: 'LONG',
      entry_price: 250.00,
      current_price: 265.50,
      stop_loss: 245.00,
      targets: [270.00, 280.00, 290.00],
      targets_hit: [],
      position_size: 50,
      status: 'active',
      pnl: 775.00,
      pnl_percent: 6.20
    },
    {
      symbol: 'NVDA',
      direction: 'SHORT',
      entry_price: 500.00,
      current_price: 485.00,
      stop_loss: 510.00,
      targets: [480.00, 470.00, 460.00],
      targets_hit: [],
      position_size: 25,
      status: 'active',
      pnl: 375.00,
      pnl_percent: 3.00
    }
  ];

  const postData = JSON.stringify(insertData);

  const insertOptions = {
    hostname: 'edwbteayhvstevglrrnx.supabase.co',
    port: 443,
    path: '/rest/v1/swing_positions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
      'Content-Length': postData.length
    }
  };

  const insertReq = https.request(insertOptions, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log(`Insert Status: ${res.statusCode}`);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Fresh data inserted!\n');
        console.log('📊 Inserted 3 positions: AAPL, TSLA, NVDA\n');
        console.log('=' .repeat(60));
        console.log('🎉 CLEANUP COMPLETE!');
        console.log('=' .repeat(60));
        console.log('\n🧪 Running tests now...\n');
        
        // Run tests
        const { exec } = require('child_process');
        exec('export $(cat .env.local | grep -v \'^#\' | grep -v \'^=\' | xargs) && node tests/member-portal-e2e.test.js', 
          (error, stdout, stderr) => {
            console.log(stdout);
            if (stderr) console.error(stderr);
          }
        );
      } else {
        console.log('❌ Insert failed:', responseData);
      }
    });
  });

  insertReq.on('error', (error) => {
    console.error('❌ Insert request failed:', error.message);
  });

  insertReq.write(postData);
  insertReq.end();
}
