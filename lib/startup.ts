// Server startup initialization
// Auto-starts Databento RAW TCP connection

import { getDatabentoClient } from './databento-raw-client'
import { ibGatewayManager } from './ib-gateway-connection-manager-pro'

console.log('================================================================================')
console.log('🚀 NEXURAL TRADING - SERVER STARTUP')
console.log('================================================================================')

// Auto-start Databento connection
async function initializeDatabento() {
  try {
    console.log('📊 [1/3] Initializing Databento RAW TCP client...')
    
    const client = getDatabentoClient()
    
    // Connect and authenticate
    console.log('📊 [2/3] Connecting to Databento gateway...')
    await client.connect()
    
    // Subscribe to all futures
    console.log('📊 [3/3] Subscribing to all 18 futures symbols...')
    await client.subscribeToAllFutures('trades')
    
    // Start the session
    client.startSession()
    
    console.log('✅ Databento service running')
    console.log('   → Connected via TCP to glbx-mdp3.lsg.databento.com:13000')
    console.log('   → Monitoring 18 futures symbols')
    console.log('   → Real-time trade data streaming')
    
    // Log incoming data
    let dataCount = 0
    client.on('data', (record: any) => {
      dataCount++
      if (dataCount % 100 === 0) {
        console.log(`📊 Received ${dataCount} trade records...`)
      }
    })
    
    // Handle errors
    client.on('error', (error: Error) => {
      console.error('❌ Databento error:', error.message)
    })
    
    // Handle disconnections
    client.on('disconnected', () => {
      console.log('⚠️ Databento disconnected - will auto-reconnect')
    })
    
  } catch (error) {
    console.error('❌ Failed to initialize Databento:', error)
    console.error('   → Check API key in .env.local')
    console.error('   → Verify network connectivity')
    console.error('   → Check Databento account status')
  }
}

// Initialize IB Gateway
async function initializeIBGateway() {
  try {
    console.log('🔌 [IB] Initializing IB Gateway Connection Manager...')
    await ibGatewayManager.initialize()
    console.log('✅ IB Gateway manager initialized')
  } catch (error) {
    console.error('❌ Failed to initialize IB Gateway:', error)
  }
}

// Start initialization - TEMPORARILY DISABLED FOR DEVELOPMENT
// Uncomment these when ready to use live data
// initializeDatabento()
// initializeIBGateway()

console.log('================================================================================')
console.log('✅ STARTUP COMPLETE (Databento/IB Gateway disabled for dev)')
console.log('================================================================================')
