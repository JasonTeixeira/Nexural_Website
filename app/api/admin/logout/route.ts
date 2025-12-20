import { NextRequest, NextResponse } from 'next/server'
import { ServerSessionService } from '@/lib/server-session-service'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (token) {
      await ServerSessionService.destroySession(token)
    }
    
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the admin authentication cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expire immediately
      path: '/'
    })

    console.log('Admin logout successful')

    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin Logout Endpoint',
    method: 'POST'
  })
}
