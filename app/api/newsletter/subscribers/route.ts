import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/admin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin endpoint to get newsletter subscribers
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(['owner', 'support'])
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'subscribed'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get subscribers with pagination
    const { data: subscribers, error, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching subscribers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    // Get stats
    const { data: stats } = await supabase
      .from('newsletter_subscribers')
      .select('status')

    const statsCount = stats?.reduce((acc: any, sub: any) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      subscribers,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      stats: {
        subscribed: statsCount.subscribed || 0,
        unsubscribed: statsCount.unsubscribed || 0,
        total: stats?.length || 0
      }
    })

  } catch (error) {
    console.error('Newsletter subscribers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Unsubscribe endpoint
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin(['owner', 'support'])
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Update subscriber status to unsubscribed
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())

    if (error) {
      console.error('Error unsubscribing:', error)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
