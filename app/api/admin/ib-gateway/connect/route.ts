/**
 * API Route: Connect to IB Gateway
 */

import { NextRequest, NextResponse } from 'next/server'
import { ibGatewayManager } from '@/lib/ib-gateway-connection-manager-pro'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 API: Connect to IB Gateway requested')
    
    const success = await ibGatewayManager.connect()
    
    if (success) {
      const status = ibGatewayManager.getStatus()
      
      return NextResponse.json({
        success: true,
        message: 'Connection initiated',
        status
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Connection failed',
        status: ibGatewayManager.getStatus()
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ API: Connect error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
