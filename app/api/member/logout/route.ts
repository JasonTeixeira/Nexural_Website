import { NextRequest, NextResponse } from 'next/server'
import { ServerSessionService } from '@/lib/server-session-service'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('member_token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (token) {
      await ServerSessionService.destroySession(token)
    }
    
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
    
    // Clear the cookie
    response.cookies.delete('member_token')
    
    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 })
  }
}
