import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/database-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await getAdminUser(token)
    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get newsletter subscribers from database
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching newsletter subscribers:', error)
      // Return default stats if table doesn't exist yet
      return NextResponse.json({ 
        subscribers: [],
        stats: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          campaignsSent: 0,
          avgOpenRate: 0
        },
        message: 'No subscribers found - table may not exist yet'
      })
    }

    // Calculate stats
    const totalSubscribers = subscribers?.length || 0
    const activeSubscribers = subscribers?.filter(sub => sub.is_active)?.length || 0
    
    // Get campaign stats (if campaigns table exists)
    let campaignsSent = 0
    let avgOpenRate = 0
    
    try {
      const { data: campaigns } = await supabase
        .from('newsletter_campaigns')
        .select('id, open_rate')
        .eq('status', 'sent')

      if (campaigns) {
        campaignsSent = campaigns.length
        if (campaigns.length > 0) {
          const totalOpenRate = campaigns.reduce((sum, campaign) => sum + (campaign.open_rate || 0), 0)
          avgOpenRate = Math.round(totalOpenRate / campaigns.length)
        }
      }
    } catch (campaignError) {
      console.log('Newsletter campaigns table not found, using default values')
    }

    const stats = {
      totalSubscribers,
      activeSubscribers,
      campaignsSent,
      avgOpenRate
    }

    return NextResponse.json({ 
      subscribers: subscribers || [],
      stats,
      total: totalSubscribers
    })
  } catch (error) {
    console.error('Error in GET /api/admin/newsletter/subscribers:', error)
    return NextResponse.json({ 
      subscribers: [],
      stats: {
        totalSubscribers: 0,
        activeSubscribers: 0,
        campaignsSent: 0,
        avgOpenRate: 0
      },
      error: 'Failed to fetch newsletter data'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await getAdminUser(token)
    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, source = 'admin' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Add new subscriber
    const { data: subscriber, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        name: name || '',
        source,
        is_active: true,
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 })
      }
      console.error('Error adding newsletter subscriber:', error)
      return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      subscriber,
      message: 'Subscriber added successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/newsletter/subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await getAdminUser(token)
    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Remove subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', email.toLowerCase())

    if (error) {
      console.error('Error removing newsletter subscriber:', error)
      return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscriber removed successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/newsletter/subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
