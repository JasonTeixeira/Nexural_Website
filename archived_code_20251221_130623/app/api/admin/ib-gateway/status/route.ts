/**
 * API Route: Get IB Gateway Status
 */

import { NextRequest, NextResponse } from 'next/server'
import { ibGatewayManager } from '@/lib/ib-gateway-connection-manager-pro'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const status = ibGatewayManager.getStatus()
    const events = ibGatewayManager.getEvents(50)
    const positions = ibGatewayManager.getPositions()
    const orders = ibGatewayManager.getOrders()
    const accountSummary = ibGatewayManager.getAccountSummary()
    
    return NextResponse.json({
      success: true,
      status,
      events,
      positions,
      orders,
      accountSummary,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ API: Status error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
