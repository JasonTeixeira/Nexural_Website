import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET endpoint to check newsletter status
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Get recent campaigns
    const { data: campaigns, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    })
  } catch (error: any) {
    console.error('Newsletter status error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, content, previewText, subscribers } = body

    // Input validation
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Valid subject is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Valid content is required' },
        { status: 400 }
      )
    }

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No subscribers to send to' },
        { status: 400 }
      )
    }

    // Initialize Supabase
    const supabase = createClient()

    // Send emails
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const subscriber of subscribers) {
      try {
        // Send email via Resend
        const { data, error } = await resend.emails.send({
          from: 'Nexural Trading <onboarding@resend.dev>', // Use verified domain in production
          to: subscriber.email,
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                ${previewText ? `<p style="color: #666; font-size: 14px;">${previewText}</p>` : ''}
                <div style="margin-top: 20px;">
                  ${content}
                </div>
                <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                  You're receiving this email because you subscribed to Nexural Trading newsletter.<br>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #666;">Unsubscribe</a>
                </p>
              </body>
            </html>
          `,
          text: content.replace(/<[^>]*>/g, '') // Strip HTML for text version
        })

        if (error) {
          results.failed++
          results.errors.push(`${subscriber.email}: ${error.message}`)
        } else {
          results.sent++

          // Log to database
          await supabase
            .from('email_sequences')
            .insert({
              subscriber_id: subscriber.id,
              email_type: 'campaign',
              subject: subject,
              sent_at: new Date().toISOString(),
              status: 'sent'
            })
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (err: any) {
        results.failed++
        results.errors.push(`${subscriber.email}: ${err.message}`)
      }
    }

    // Create campaign record
    await supabase
      .from('newsletter_campaigns')
      .insert({
        subject: subject,
        content: content,
        sent_to: subscribers.length,
        sent_at: new Date().toISOString(),
        status: 'sent'
      })

    return NextResponse.json({
      success: true,
      message: `Campaign sent successfully! ${results.sent} sent, ${results.failed} failed.`,
      results
    })
  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
