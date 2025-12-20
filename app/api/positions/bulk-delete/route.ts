import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { positionIds } = body

    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      return NextResponse.json(
        { error: 'Position IDs are required' },
        { status: 400 }
      )
    }

    // First, delete associated option legs (if any)
    const { error: legsDeleteError } = await supabase
      .from('option_legs')
      .delete()
      .in('position_id', positionIds)

    if (legsDeleteError) {
      console.error('Error deleting option legs:', legsDeleteError)
      // Continue even if this fails - positions without legs will still be deleted
    }

    // Delete the positions
    const { error: deleteError, count } = await supabase
      .from('positions')
      .delete()
      .in('id', positionIds)

    if (deleteError) {
      console.error('Error deleting positions:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete positions', details: deleteError.message },
        { status: 500 }
      )
    }

    // Return success with deleted count
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${positionIds.length} position(s)`,
      count: positionIds.length,
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
