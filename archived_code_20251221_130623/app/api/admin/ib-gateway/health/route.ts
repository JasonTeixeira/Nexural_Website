/**
 * API Route: IB Gateway Health Check
 */

import { NextRequest, NextResponse } from 'next/server'
import { ibGatewayManager } from '@/lib/ib-gateway-connection-manager-pro'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const isHealthy = await ibGatewayManager.healthCheck()
    const status = ibGatewayManager.getStatus()
    
    return NextResponse.json({
      success: true,
      healthy: isHealthy,
      status,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ API: Health check error:', error)
    
    return NextResponse.json({
      success: false,
      healthy: false,
      error: error.message
    }, { status: 500 })
  }
}
