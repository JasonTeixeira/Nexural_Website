import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FallbackAuth } from '@/lib/fallback-auth'
import { discordAPI } from '@/lib/discord'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/swing-positions
 * List all swing positions (active and historical)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isValid = await FallbackAuth.verifyToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, closed, all
    const symbol = searchParams.get('symbol')

    // Build query
    let query = supabase
      .from('swing_positions')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (symbol) {
      query = query.eq('symbol', symbol.toUpperCase())
    }

    const { data: positions, error } = await query

    if (error) {
      console.error('Error fetching swing positions:', error)
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
    }

    // Calculate real-time P&L for active positions
    const positionsWithPnL = positions.map(position => {
      if (position.status === 'active' && position.current_price) {
        const pnl = position.direction === 'LONG'
          ? (position.current_price - position.entry_price) * position.position_size
          : (position.entry_price - position.current_price) * position.position_size
        
        const pnlPercentage = position.direction === 'LONG'
          ? ((position.current_price - position.entry_price) / position.entry_price) * 100
          : ((position.entry_price - position.current_price) / position.entry_price) * 100

        return {
          ...position,
          calculated_pnl: pnl,
          calculated_pnl_percentage: pnlPercentage
        }
      }
      return position
    })

    return NextResponse.json({
      success: true,
      positions: positionsWithPnL,
      count: positionsWithPnL.length
    })

  } catch (error) {
    console.error('Error in GET /api/admin/swing-positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/swing-positions
 * Create a new swing position
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isValid = await FallbackAuth.verifyToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      symbol,
      direction,
      entry_price,
      stop_loss,
      target_1,
      target_2,
      target_3,
      position_size,
      entry_notes
    } = body

    // Validation
    if (!symbol || !direction || !entry_price || !stop_loss || !position_size) {
      return NextResponse.json({ 
        error: 'Missing required fields: symbol, direction, entry_price, stop_loss, position_size' 
      }, { status: 400 })
    }

    if (!['LONG', 'SHORT'].includes(direction)) {
      return NextResponse.json({ error: 'Direction must be LONG or SHORT' }, { status: 400 })
    }

    // Create position
    const { data: position, error } = await supabase
      .from('swing_positions')
      .insert({
        symbol: symbol.toUpperCase(),
        direction,
        entry_price: parseFloat(entry_price),
        current_price: parseFloat(entry_price), // Start with entry price
        stop_loss: parseFloat(stop_loss),
        target_1: target_1 ? parseFloat(target_1) : null,
        target_2: target_2 ? parseFloat(target_2) : null,
        target_3: target_3 ? parseFloat(target_3) : null,
        position_size: parseInt(position_size),
        status: 'active',
        entry_notes,
        unrealized_pnl: 0,
        pnl_percentage: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating swing position:', error)
      return NextResponse.json({ error: 'Failed to create position' }, { status: 500 })
    }

    // Log the creation in updates table
    await supabase
      .from('swing_position_updates')
      .insert({
        position_id: position.id,
        update_type: 'created',
        new_price: entry_price,
        new_status: 'active',
        notes: entry_notes,
        pnl_at_update: 0
      })

    // Send Discord notification
    try {
      const discordChannelId = process.env.DISCORD_SIGNALS_CHANNEL_ID || 
                               process.env.DISCORD_GENERAL_CHANNEL_ID!

      const riskReward = target_1 
        ? ((parseFloat(target_1) - parseFloat(entry_price)) / (parseFloat(entry_price) - parseFloat(stop_loss))).toFixed(2)
        : 'N/A'

      const embed = {
        embeds: [{
          title: `🎯 NEW SWING POSITION: ${symbol}`,
          description: entry_notes || 'New swing position opened',
          color: direction === 'LONG' ? 0x10b981 : 0xef4444,
          fields: [
            {
              name: '📊 Symbol',
              value: `**${symbol}**`,
              inline: true
            },
            {
              name: '📈 Direction',
              value: `**${direction === 'LONG' ? '🟢 LONG' : '🔴 SHORT'}**`,
              inline: true
            },
            {
              name: '💰 Position Size',
              value: `${position_size} shares`,
              inline: true
            },
            {
              name: '🎯 Entry Price',
              value: `$${parseFloat(entry_price).toFixed(2)}`,
              inline: true
            },
            {
              name: '🛑 Stop Loss',
              value: `$${parseFloat(stop_loss).toFixed(2)}`,
              inline: true
            },
            {
              name: '⚖️ Risk/Reward',
              value: `1:${riskReward}`,
              inline: true
            },
            {
              name: '🎯 Targets',
              value: [
                target_1 ? `T1: $${parseFloat(target_1).toFixed(2)}` : null,
                target_2 ? `T2: $${parseFloat(target_2).toFixed(2)}` : null,
                target_3 ? `T3: $${parseFloat(target_3).toFixed(2)}` : null
              ].filter(Boolean).join(' | ') || 'No targets set',
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Nexural Trading • Swing Position'
          }
        }]
      }

      const sent = await discordAPI.sendRichEmbed(discordChannelId, embed)
      
      if (sent) {
        console.log(`✅ Swing position notification sent to Discord: ${symbol}`)
      }
    } catch (discordError) {
      console.error('Discord notification failed:', discordError)
      // Don't fail the request if Discord fails
    }

    return NextResponse.json({
      success: true,
      message: 'Swing position created successfully',
      position
    })

  } catch (error) {
    console.error('Error in POST /api/admin/swing-positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/swing-positions
 * Update an existing swing position
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isValid = await FallbackAuth.verifyToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      current_price,
      status,
      update_notes,
      exit_notes
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Position ID required' }, { status: 400 })
    }

    // Get existing position
    const { data: existingPosition, error: fetchError } = await supabase
      .from('swing_positions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingPosition) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Calculate P&L if price updated
    let unrealized_pnl = existingPosition.unrealized_pnl
    let pnl_percentage = existingPosition.pnl_percentage
    let realized_pnl = existingPosition.realized_pnl

    if (current_price) {
      const price = parseFloat(current_price)
      if (existingPosition.direction === 'LONG') {
        unrealized_pnl = (price - existingPosition.entry_price) * existingPosition.position_size
        pnl_percentage = ((price - existingPosition.entry_price) / existingPosition.entry_price) * 100
      } else {
        unrealized_pnl = (existingPosition.entry_price - price) * existingPosition.position_size
        pnl_percentage = ((existingPosition.entry_price - price) / existingPosition.entry_price) * 100
      }

      // If closing position, move unrealized to realized
      if (status && status !== 'active') {
        realized_pnl = unrealized_pnl
        unrealized_pnl = 0
      }
    }

    // Update position
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (current_price) {
      updateData.current_price = parseFloat(current_price)
      updateData.unrealized_pnl = unrealized_pnl
      updateData.pnl_percentage = pnl_percentage
    }

    if (status) {
      updateData.status = status
      if (status !== 'active') {
        updateData.closed_at = new Date().toISOString()
        updateData.realized_pnl = realized_pnl
      }
    }

    if (update_notes) {
      updateData.update_notes = update_notes
    }

    if (exit_notes) {
      updateData.exit_notes = exit_notes
    }

    const { data: updatedPosition, error: updateError } = await supabase
      .from('swing_positions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating swing position:', updateError)
      return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
    }

    // Log the update
    await supabase
      .from('swing_position_updates')
      .insert({
        position_id: id,
        update_type: status && status !== existingPosition.status ? 'status_change' : 'price_update',
        old_price: existingPosition.current_price,
        new_price: current_price ? parseFloat(current_price) : existingPosition.current_price,
        old_status: existingPosition.status,
        new_status: status || existingPosition.status,
        notes: update_notes || exit_notes,
        pnl_at_update: status && status !== 'active' ? realized_pnl : unrealized_pnl
      })

    // Send Discord update
    try {
      const discordChannelId = process.env.DISCORD_SIGNALS_CHANNEL_ID || 
                               process.env.DISCORD_GENERAL_CHANNEL_ID!

      const statusEmoji: Record<string, string> = {
        'active': '🟢',
        'closed': '✅',
        'stopped_out': '🛑',
        'target_hit': '🎯'
      }

      const embed = {
        embeds: [{
          title: `${statusEmoji[status || 'active'] || '📊'} SWING POSITION UPDATE: ${existingPosition.symbol}`,
          description: update_notes || exit_notes || 'Position updated',
          color: (realized_pnl || unrealized_pnl) >= 0 ? 0x10b981 : 0xef4444,
          fields: [
            {
              name: '📊 Symbol',
              value: `**${existingPosition.symbol}**`,
              inline: true
            },
            {
              name: '📈 Direction',
              value: `**${existingPosition.direction}**`,
              inline: true
            },
            {
              name: '💰 Status',
              value: `**${status || existingPosition.status}**`,
              inline: true
            },
            {
              name: '🎯 Entry',
              value: `$${existingPosition.entry_price.toFixed(2)}`,
              inline: true
            },
            {
              name: '📍 Current',
              value: `$${(current_price || existingPosition.current_price).toFixed(2)}`,
              inline: true
            },
            {
              name: '💵 P&L',
              value: `$${(realized_pnl || unrealized_pnl).toFixed(2)} (${pnl_percentage.toFixed(2)}%)`,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Nexural Trading • Swing Position Update'
          }
        }]
      }

      await discordAPI.sendRichEmbed(discordChannelId, embed)
    } catch (discordError) {
      console.error('Discord notification failed:', discordError)
    }

    return NextResponse.json({
      success: true,
      message: 'Position updated successfully',
      position: updatedPosition
    })

  } catch (error) {
    console.error('Error in PUT /api/admin/swing-positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/swing-positions
 * Delete a swing position (admin only, use with caution)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isValid = await FallbackAuth.verifyToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Position ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('swing_positions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting swing position:', error)
      return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/swing-positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
