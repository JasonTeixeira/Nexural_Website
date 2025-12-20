import { NextRequest, NextResponse } from 'next/server'
import { databentoStreamManager } from '@/lib/databento-stream-manager'

// Auto-start endpoint for Databento live feeds
// This should be called when the application starts up

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting Databento live feeds system...')
    
    // Start all live feeds
    await databentoStreamManager.startAllFeeds()
    
    // Get system status
    const systemStatus = databentoStreamManager.getSystemStatus()
    const healthStatus = databentoStreamManager.getHealthStatus()
    
    console.log('✅ Databento live feeds started successfully')
    
    return NextResponse.json({
      success: true,
      message: '24/7 Databento live feeds started successfully',
      system: systemStatus,
      feeds: Object.fromEntries(healthStatus),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Failed to start Databento live feeds:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to start live feeds',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'restart') {
      console.log('🔄 Restarting Databento live feeds system...')
      
      // Stop all feeds first
      await databentoStreamManager.stopAllFeeds()
      
      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Start all feeds again
      await databentoStreamManager.startAllFeeds()
      
      const systemStatus = databentoStreamManager.getSystemStatus()
      
      return NextResponse.json({
        success: true,
        message: 'Live feeds restarted successfully',
        system: systemStatus,
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'stop') {
      console.log('🛑 Stopping Databento live feeds system...')
      
      await databentoStreamManager.stopAllFeeds()
      
      return NextResponse.json({
        success: true,
        message: 'Live feeds stopped successfully',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: restart or stop'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Error in startup POST:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process startup request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
