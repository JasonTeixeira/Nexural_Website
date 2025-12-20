import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { getDiscordWebhook } from '@/lib/discord-webhook'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { event_type, shares, price, note, send_discord = true } = body

    // Get current position
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (positionError || !position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    let newTotalShares = position.shares_contracts
    let newAvgPrice = position.current_avg_price || position.entry_price
    let newStatus = position.status

    // Calculate new values based on event type
    if (event_type === 'add') {
      // Adding shares - recalculate average price
      const currentValue = newTotalShares * newAvgPrice
      const addedValue = shares * price
      newTotalShares = newTotalShares + shares
      newAvgPrice = (currentValue + addedValue) / newTotalShares
    } else if (event_type === 'trim') {
      // Trimming shares - keep same average price
      newTotalShares = Math.max(0, newTotalShares - shares)
      if (newTotalShares === 0) {
        newStatus = 'closed'
      }
    } else if (event_type === 'close') {
      // Closing position
      newTotalShares = 0
      newStatus = 'closed'
    }

    // Update position
    const { error: updateError } = await supabase
      .from('positions')
      .update({
        shares_contracts: newTotalShares,
        current_avg_price: newAvgPrice,
        status: newStatus,
        exit_date: newStatus === 'closed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating position:', updateError)
      return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
    }

    // Create position event record
    const { data: eventData, error: eventError } = await supabase
      .from('position_events')
      .insert({
        position_id: params.id,
        event_type,
        shares,
        price,
        total_shares: newTotalShares,
        avg_price: newAvgPrice,
        note,
        discord_sent: false,
      })
      .select()
      .single()

    if (eventError) {
      console.error('Error creating event:', eventError)
    }

    // Send Discord notification if enabled
    if (send_discord && eventData) {
      const webhook = getDiscordWebhook()
      if (webhook) {
        const positionUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/positions/${params.id}`
        
        let discordSent = false

        if (event_type === 'add') {
          discordSent = await webhook.notifyUpdate({
            ticker: position.ticker,
            companyName: position.company_name,
            action: 'add',
            price,
            shares,
            totalShares: newTotalShares,
            newAvgPrice,
            note,
            positionUrl,
          })
        } else if (event_type === 'trim') {
          discordSent = await webhook.notifyUpdate({
            ticker: position.ticker,
            companyName: position.company_name,
            action: 'trim',
            price,
            shares,
            totalShares: newTotalShares,
            newAvgPrice,
            note,
            positionUrl,
          })
        } else if (event_type === 'close') {
          // Calculate P&L
          const totalCost = position.shares_contracts * (position.current_avg_price || position.entry_price)
          const totalValue = position.shares_contracts * price
          const pnl = totalValue - totalCost
          const pnlPct = (pnl / totalCost) * 100
          
          // Calculate R-multiple
          const riskAmount = position.shares_contracts * Math.abs(position.entry_price - position.stop_loss)
          const rMultiple = riskAmount > 0 ? pnl / riskAmount : 0
          
          // Calculate days held
          const entryDate = new Date(position.entry_date)
          const exitDate = new Date()
          const daysHeld = Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

          discordSent = await webhook.notifyExit({
            ticker: position.ticker,
            companyName: position.company_name,
            direction: position.direction,
            exitPrice: price,
            shares: position.shares_contracts,
            pnl,
            pnlPct,
            rMultiple,
            daysHeld,
            reason: note,
            positionUrl,
          })
        }

        // Update event with discord status
        if (discordSent) {
          await supabase
            .from('position_events')
            .update({ discord_sent: true })
            .eq('id', eventData.id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      event: eventData,
      position: {
        id: params.id,
        shares: newTotalShares,
        avgPrice: newAvgPrice,
        status: newStatus,
      },
    })
  } catch (error) {
    console.error('Position event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
