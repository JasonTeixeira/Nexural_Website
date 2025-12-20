import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { testAllChannels } from '@/lib/discord-channels'

export async function POST(request: Request) {
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

    // Test all channels
    const results = await testAllChannels()

    // Check environment variables
    const config = {
      hasDefault: !!process.env.DISCORD_WEBHOOK_URL,
      hasSelling: !!process.env.DISCORD_WEBHOOK_SELLING,
      hasSwings: !!process.env.DISCORD_WEBHOOK_SWINGS,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    }

    return NextResponse.json({
      success: true,
      results,
      config,
      message: 'Discord webhook tests completed',
    })
  } catch (error) {
    console.error('Discord test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
