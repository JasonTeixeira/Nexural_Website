import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { followingUserId, action } = await request.json()

    if (!followingUserId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Can't follow yourself
    if (followingUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    if (action === 'follow') {
      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_user_id', user.id)
        .eq('following_user_id', followingUserId)
        .single()

      if (existing) {
        return NextResponse.json(
          { success: true, message: 'Already following' },
          { status: 200 }
        )
      }

      // Create follow relationship
      const { error: followError } = await supabase
        .from('user_follows')
        .insert({
          follower_user_id: user.id,
          following_user_id: followingUserId
        })

      if (followError) {
        console.error('Follow error:', followError)
        return NextResponse.json(
          { error: 'Failed to follow user' },
          { status: 500 }
        )
      }

      // Increment follower count
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('follower_count')
        .eq('user_id', followingUserId)
        .single()
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          follower_count: (profile?.follower_count || 0) + 1
        })
        .eq('user_id', followingUserId)

      if (updateError) {
        console.error('Update follower count error:', updateError)
      }

      return NextResponse.json(
        { success: true, message: 'Successfully followed user' },
        { status: 200 }
      )
    } 
    
    if (action === 'unfollow') {
      // Delete follow relationship
      const { error: unfollowError } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_user_id', user.id)
        .eq('following_user_id', followingUserId)

      if (unfollowError) {
        console.error('Unfollow error:', unfollowError)
        return NextResponse.json(
          { error: 'Failed to unfollow user' },
          { status: 500 }
        )
      }

      // Decrement follower count
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('follower_count')
        .eq('user_id', followingUserId)
        .single()
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          follower_count: Math.max((profile?.follower_count || 0) - 1, 0)
        })
        .eq('user_id', followingUserId)

      if (updateError) {
        console.error('Update follower count error:', updateError)
      }

      return NextResponse.json(
        { success: true, message: 'Successfully unfollowed user' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Follow API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if following
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ following: [] }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('userIds')?.split(',') || []

    if (userIds.length === 0) {
      return NextResponse.json({ following: [] }, { status: 200 })
    }

    // Get all follow relationships for current user
    const { data, error } = await supabase
      .from('user_follows')
      .select('following_user_id')
      .eq('follower_user_id', user.id)
      .in('following_user_id', userIds)

    if (error) {
      console.error('Get follows error:', error)
      return NextResponse.json({ following: [] }, { status: 200 })
    }

    const followingIds = data.map((f: { following_user_id: string }) => f.following_user_id)

    return NextResponse.json(
      { following: followingIds },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get follows API error:', error)
    return NextResponse.json({ following: [] }, { status: 200 })
  }
}
