#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })

const { getDatabentoLiveService } = require('../lib/databento-live-service')

async function main() {
  console.log('🚀 DATABENTO LIVE DATA COLLECTION SERVICE')
  console.log('=' .repeat(60))
  console.log('Starting 24/7 market data collection...')
  console.log('')
  
  const service = getDatabentoLiveService()
  
  // Set up event listeners
  service.on('started', () => {
    console.log('✅ Service started successfully')
  })
  
  service.on('data', (record) => {
    // Data is being saved automatically
  })
  
  service.on('error', (error) => {
    console.error('❌ Service error:', error.message)
  })
  
  service.on('disconnected', () => {
    console.log('⚠️  Service disconnected, will attempt reconnect...')
  })
  
  service.on('heartbeat', (status) => {
    // Status logged automatically
  })
  
  service.on('max_reconnects', () => {
    console.error('❌ Max reconnection attempts reached. Exiting.')
    process.exit(1)
  })
  
  // Start the service
  try {
    await service.start()
  } catch (error) {
    console.error('❌ Fatal error starting service:', error)
    process.exit(1)
  }
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...')
    service.stop()
    setTimeout(() => process.exit(0), 1000)
  })
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
    service.stop()
    setTimeout(() => process.exit(0), 1000)
  })
  
  console.log('✅ Service running. Press Ctrl+C to stop.')
  console.log('📊 Data is being saved to live_market_data table')
  console.log('')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
