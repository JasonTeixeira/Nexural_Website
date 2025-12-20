import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    // Build query
    let query = supabase
      .from('algo_trading_waitlist')
      .select('*')
      .order('current_position', { ascending: true })
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    const { data: waitlist, error } = await query
    
    if (error) {
      throw error
    }
    
    // Get stats
    const { count: totalSignups } = await supabase
      .from('algo_trading_waitlist')
      .select('*', { count: 'exact', head: true })
    
    const { count: todaySignups } = await supabase
      .from('algo_trading_waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('signup_date', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    
    const { data: referralStats } = await supabase
      .from('algo_trading_waitlist')
      .select('referrals_made')
    
    const totalReferrals = referralStats?.reduce((sum, member) => sum + (member.referrals_made || 0), 0) || 0
    const avgReferrals = totalSignups ? (totalReferrals / totalSignups).toFixed(1) : 0
    
    const { data: topReferrer } = await supabase
      .from('algo_trading_waitlist')
      .select('name, referrals_made')
      .order('referrals_made', { ascending: false })
      .limit(1)
      .single()
    
    const conversionRate = totalSignups && totalReferrals 
      ? ((totalReferrals / totalSignups) * 100).toFixed(1) 
      : 0
    
    return NextResponse.json({
      success: true,
      waitlist,
      stats: {
        totalSignups: totalSignups || 0,
        todaySignups: todaySignups || 0,
        totalReferrals,
        avgReferralsPerMember: avgReferrals,
        topReferrer: topReferrer ? `${topReferrer.name} (${topReferrer.referrals_made} referrals)` : 'N/A',
        conversionRate: `${conversionRate}%`
      }
    })
    
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const body = await req.json()
    const { action, memberIds, emailType } = body
    
    if (action === 'send_beta_invite') {
      // Send beta invitations
      for (const memberId of memberIds) {
        const { data: member } = await supabase
          .from('algo_trading_waitlist')
          .select('*')
          .eq('member_id', memberId)
          .single()
        
        if (member) {
          // TODO: Send email via email service
          console.log(`Sending beta invite to ${member.email}`)
          
          // Update status
          await supabase
            .from('algo_trading_waitlist')
            .update({ 
              status: 'invited',
              invited_date: new Date().toISOString()
            })
            .eq('member_id', memberId)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Sent ${memberIds.length} beta invitations`
      })
    }
    
    if (action === 'send_campaign') {
      // Send email campaign
      const { data: members } = await supabase
        .from('algo_trading_waitlist')
        .select('email, name')
      
      // TODO: Send campaign via email service
      console.log(`Sending campaign to ${members?.length} members`)
      
      return NextResponse.json({
        success: true,
        message: `Campaign sent to ${members?.length} members`
      })
    }
    
    if (action === 'export_csv') {
      // Export to CSV
      const { data: members } = await supabase
        .from('algo_trading_waitlist')
        .select('*')
        .order('current_position', { ascending: true })
      
      return NextResponse.json({
        success: true,
        data: members
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error processing admin action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}
