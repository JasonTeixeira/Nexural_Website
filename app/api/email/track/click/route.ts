import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('c')
    const email = searchParams.get('e')
    const url = searchParams.get('u')

    if (campaignId && email && url) {
      // Track the email click asynchronously
      emailService.trackClick(
        decodeURIComponent(email), 
        campaignId, 
        decodeURIComponent(url)
      ).catch(error => {
        console.error('Failed to track email click:', error)
      })
    }

    // Redirect to the original URL
    const targetUrl = url ? decodeURIComponent(url) : process.env.NEXT_PUBLIC_APP_URL || 'https://nexuraltrading.com'
    
    return NextResponse.redirect(targetUrl, 302)

  } catch (error) {
    console.error('Error in email click tracking:', error)
    
    // Fallback redirect even if tracking fails
    const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexuraltrading.com'
    return NextResponse.redirect(fallbackUrl, 302)
  }
}
