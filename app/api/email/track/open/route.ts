import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

// 1x1 transparent pixel for email open tracking
const TRACKING_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('c')
    const email = searchParams.get('e')

    if (campaignId && email) {
      // Track the email open asynchronously
      emailService.trackOpen(decodeURIComponent(email), campaignId).catch(error => {
        console.error('Failed to track email open:', error)
      })
    }

    // Return 1x1 transparent pixel
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': TRACKING_PIXEL.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error in email open tracking:', error)
    
    // Still return the pixel even if tracking fails
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': TRACKING_PIXEL.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}
