import { NextResponse } from 'next/server'
import { isMarketOpen, getMarketHours } from '@/lib/alpaca-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const marketInfo = await getMarketHours()
    
    return NextResponse.json({
      isOpen: marketInfo.isOpen,
      nextOpen: marketInfo.nextOpen,
      nextClose: marketInfo.nextClose,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching market status:', error)
    
    // Return a default response if API fails
    return NextResponse.json({
      isOpen: false,
      nextOpen: '',
      nextClose: '',
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch market status',
    })
  }
}
