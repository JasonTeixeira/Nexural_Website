import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const authHeader = request.headers.get('authorization')
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch watchlist items for user
    const { data: watchlist, error } = await supabase
      .from('watchlist')
      .select(`
        *,
        image_count:watchlist_images(count)
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const authHeader = request.headers.get('authorization')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      ticker,
      company_name,
      notes,
      tags,
      target_entry,
      target_exit,
      alert_price,
    } = body

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      )
    }

    // Check if ticker already exists for this user
    const { data: existing } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('ticker', ticker.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ticker already in watchlist' },
        { status: 409 }
      )
    }

    // Insert new watchlist item
    const { data: watchlistItem, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        ticker: ticker.toUpperCase(),
        company_name,
        notes,
        tags,
        target_entry,
        target_exit,
        alert_price,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ watchlistItem }, { status: 201 })
  } catch (error) {
    console.error('Error creating watchlist item:', error)
    return NextResponse.json(
      { error: 'Failed to create watchlist item' },
      { status: 500 }
    )
  }
}
