/**
 * API Route: Disconnect from IB Gateway
 */

import { NextRequest, NextResponse } from 'next/server'
import { ibGatewayManager } from '@/lib/ib-gateway-connection-manager-pro'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 API: Disconnect from IB Gateway requested')
    
    await ibGatewayManager.disconnect(true) // Manual disconnect
    
    return NextResponse.json({
      success: true,
      message: 'Disconnected successfully',
      status: ibGatewayManager.getStatus()
    })
    
  } catch (error: any) {
    console.error('❌ API: Disconnect error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
