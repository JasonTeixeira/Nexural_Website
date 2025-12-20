import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all positions in user's watchlist
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get watchlist with position details
    const { data: watchlist, error } = await supabase
      .from('position_watchlist')
      .select(`
        id,
        notes,
        created_at,
        position_id,
        positions (
          id,
          symbol,
          company_name,
          direction,
          entry_price,
          current_price,
          exit_price,
          quantity,
          entry_date,
          exit_date,
          status,
          pnl,
          pnl_percentage,
          unrealized_pnl,
          unrealized_pnl_pct,
          stop_loss,
          target_price,
          sector,
          entry_reasoning,
          is_admin_signal,
          portfolio_id,
          portfolios (
            id,
            name,
            user_id,
            user_profiles (
              username,
              display_name,
              avatar_url
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching watchlist:', error)
      return NextResponse.json(
        { error: 'Failed to fetch watchlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      watchlist: watchlist || [],
      count: watchlist?.length || 0
    })
  } catch (error) {
    console.error('Watchlist GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add position to watchlist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { position_id, notes } = body

    if (!position_id) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      )
    }

    // Check if position exists
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('id')
      .eq('id', position_id)
      .single()

    if (positionError || !position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      )
    }

    // Add to watchlist
    const { data: watchlistItem, error: insertError } = await supabase
      .from('position_watchlist')
      .insert({
        user_id: user.id,
        position_id,
        notes: notes || null
      })
      .select()
      .single()

    if (insertError) {
      // Check if already in watchlist
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Position already in watchlist' },
          { status: 409 }
        )
      }
      
      console.error('Error adding to watchlist:', insertError)
      return NextResponse.json(
        { error: 'Failed to add to watchlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      watchlistItem
    })
  } catch (error) {
    console.error('Watchlist POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove position from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const position_id = searchParams.get('position_id')

    if (!position_id) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      )
    }

    // Remove from watchlist
    const { error: deleteError } = await supabase
      .from('position_watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('position_id', position_id)

    if (deleteError) {
      console.error('Error removing from watchlist:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove from watchlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Position removed from watchlist'
    })
  } catch (error) {
    console.error('Watchlist DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update watchlist item notes
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { position_id, notes } = body

    if (!position_id) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      )
    }

    // Update notes
    const { data: updated, error: updateError } = await supabase
      .from('position_watchlist')
      .update({ notes })
      .eq('user_id', user.id)
      .eq('position_id', position_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating watchlist notes:', updateError)
      return NextResponse.json(
        { error: 'Failed to update watchlist notes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      watchlistItem: updated
    })
  } catch (error) {
    console.error('Watchlist PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
