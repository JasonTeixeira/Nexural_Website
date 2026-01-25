import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin, requireRole } from '@/lib/admin-rbac'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all positions
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const symbol = searchParams.get('symbol')

    let query = supabase
      .from('portfolio_positions')
      .select(`
        *,
        portfolio_position_tags (
          tag_name,
          tag_category
        )
      `)
      .order('entry_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (symbol) {
      query = query.ilike('symbol', `%${symbol}%`)
    }

    const { data: positions, error } = await query

    if (error) {
      console.error('Error fetching positions:', error)
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
    }

    return NextResponse.json({ positions })
  } catch (error) {
    console.error('Error in GET /api/admin/portfolio/positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new position
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRole(admin, ['owner'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      symbol,
      company_name,
      entry_date,
      entry_price,
      current_price,
      position_size,
      stop_loss,
      target_price_1,
      target_price_2,
      target_price_3,
      confidence_level,
      entry_reasoning,
      trade_notes,
      exit_strategy,
      tags = []
    } = body

    // Calculate risk metrics
    const risk_amount = stop_loss ? (entry_price - stop_loss) * position_size : 0
    const risk_reward_ratio = (target_price_1 && stop_loss) 
      ? (target_price_1 - entry_price) / (entry_price - stop_loss) 
      : 0

    // Insert position
    const { data: position, error: positionError } = await supabase
      .from('portfolio_positions')
      .insert({
        symbol: symbol.toUpperCase(),
        company_name,
        entry_date,
        entry_price,
        current_price: current_price || entry_price,
        position_size,
        stop_loss,
        target_price_1,
        target_price_2,
        target_price_3,
        confidence_level,
        entry_reasoning,
        trade_notes,
        exit_strategy,
        risk_amount,
        risk_reward_ratio
      })
      .select()
      .single()

    if (positionError) {
      console.error('Error creating position:', positionError)
      return NextResponse.json({ error: 'Failed to create position' }, { status: 500 })
    }

    // Insert tags if provided
    if (tags.length > 0 && position) {
      const tagInserts = tags.map((tag: { name: string; category: string }) => ({
        position_id: position.id,
        tag_name: tag.name,
        tag_category: tag.category
      }))

      const { error: tagsError } = await supabase
        .from('portfolio_position_tags')
        .insert(tagInserts)

      if (tagsError) {
        console.error('Error creating tags:', tagsError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ position, message: 'Position created successfully' })
  } catch (error) {
    console.error('Error in POST /api/admin/portfolio/positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update position
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRole(admin, ['owner'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      current_price,
      stop_loss,
      target_price_1,
      target_price_2,
      target_price_3,
      trade_notes,
      exit_strategy,
      status,
      confidence_level
    } = body

    // Calculate unrealized P&L if current_price is provided
    let updateData: any = {
      current_price,
      stop_loss,
      target_price_1,
      target_price_2,
      target_price_3,
      trade_notes,
      exit_strategy,
      status,
      confidence_level
    }

    // Get current position to calculate P&L
    if (current_price) {
      const { data: currentPosition } = await supabase
        .from('portfolio_positions')
        .select('entry_price, position_size')
        .eq('id', id)
        .single()

      if (currentPosition) {
        const unrealized_pnl = (current_price - currentPosition.entry_price) * currentPosition.position_size
        updateData.unrealized_pnl = unrealized_pnl
      }
    }

    // If closing position, set closed_at and move unrealized to realized
    if (status === 'CLOSED') {
      updateData.closed_at = new Date().toISOString()
      if (updateData.unrealized_pnl) {
        updateData.realized_pnl = updateData.unrealized_pnl
        updateData.unrealized_pnl = 0
      }
    }

    const { data: position, error } = await supabase
      .from('portfolio_positions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating position:', error)
      return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
    }

    return NextResponse.json({ position, message: 'Position updated successfully' })
  } catch (error) {
    console.error('Error in PUT /api/admin/portfolio/positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete position
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRole(admin, ['owner'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('portfolio_positions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting position:', error)
      return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Position deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/portfolio/positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
