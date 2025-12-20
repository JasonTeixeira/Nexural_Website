import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await request.json()
    
    console.log(`🔄 Updating position ${id} with:`, updates)
    
    // Update the position in the database
    const { data, error } = await supabase
      .from('portfolio_positions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('❌ Database error updating position:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update position'
      }, { status: 500 })
    }
    
    console.log('✅ Position updated successfully:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Position updated successfully',
      position: data[0]
    })
    
  } catch (error) {
    console.error('❌ Error updating position:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update position'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🗑️ Deleting position ${id}`)
    
    // Delete the position from the database
    const { error } = await supabase
      .from('portfolio_positions')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Database error deleting position:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete position'
      }, { status: 500 })
    }
    
    console.log('✅ Position deleted successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ Error deleting position:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete position'
    }, { status: 500 })
  }
}
