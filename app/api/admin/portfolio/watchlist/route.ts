import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all watchlist items
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const symbol = searchParams.get('symbol')
    const priority = searchParams.get('priority')

    let query = supabase
      .from('portfolio_watchlist')
      .select(`
        *,
        portfolio_watchlist_tags (
          tag_name,
          tag_category
        )
      `)
      .order('priority_level', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (symbol) {
      query = query.ilike('symbol', `%${symbol}%`)
    }

    if (priority) {
      query = query.gte('priority_level', parseInt(priority))
    }

    const { data: watchlist, error } = await query

    if (error) {
      console.error('Error fetching watchlist:', error)
      return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
    }

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Error in GET /api/admin/portfolio/watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new watchlist item
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      symbol,
      company_name,
      analysis_notes,
      entry_criteria,
      potential_entry_price,
      alert_price,
      priority_level,
      status,
      risk_level,
      tags = []
    } = body

    // Insert watchlist item
    const { data: watchlistItem, error: watchlistError } = await supabase
      .from('portfolio_watchlist')
      .insert({
        symbol: symbol.toUpperCase(),
        company_name,
        analysis_notes,
        entry_criteria,
        potential_entry_price,
        alert_price,
        priority_level,
        status,
        risk_level
      })
      .select()
      .single()

    if (watchlistError) {
      console.error('Error creating watchlist item:', watchlistError)
      return NextResponse.json({ error: 'Failed to create watchlist item' }, { status: 500 })
    }

    // Insert tags if provided
    if (tags.length > 0 && watchlistItem) {
      const tagInserts = tags.map((tag: { name: string; category: string }) => ({
        watchlist_id: watchlistItem.id,
        tag_name: tag.name,
        tag_category: tag.category
      }))

      const { error: tagsError } = await supabase
        .from('portfolio_watchlist_tags')
        .insert(tagInserts)

      if (tagsError) {
        console.error('Error creating watchlist tags:', tagsError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ watchlistItem, message: 'Watchlist item created successfully' })
  } catch (error) {
    console.error('Error in POST /api/admin/portfolio/watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update watchlist item
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      analysis_notes,
      entry_criteria,
      potential_entry_price,
      alert_price,
      priority_level,
      status,
      risk_level
    } = body

    const updateData = {
      analysis_notes,
      entry_criteria,
      potential_entry_price,
      alert_price,
      priority_level,
      status,
      risk_level,
      updated_at: new Date().toISOString()
    }

    const { data: watchlistItem, error } = await supabase
      .from('portfolio_watchlist')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating watchlist item:', error)
      return NextResponse.json({ error: 'Failed to update watchlist item' }, { status: 500 })
    }

    return NextResponse.json({ watchlistItem, message: 'Watchlist item updated successfully' })
  } catch (error) {
    console.error('Error in PUT /api/admin/portfolio/watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete watchlist item
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Watchlist item ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('portfolio_watchlist')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting watchlist item:', error)
      return NextResponse.json({ error: 'Failed to delete watchlist item' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Watchlist item deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/portfolio/watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
