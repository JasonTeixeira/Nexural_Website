import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { requireAdmin, requireRole } from '@/lib/admin-rbac'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/positions/[id]
 * Update a position (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication (RBAC cookie-based)
    const req = request as unknown as NextRequest
    const admin = await requireAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRole(admin, ['owner'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const supabase = createClient()

    // Update position
    const { data: position, error } = await supabase
      .from('trading_positions')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating position:', error)
      return NextResponse.json(
        { error: 'Failed to update position', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ position })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/admin/positions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/positions/[id]
 * Delete a position (admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication (RBAC cookie-based)
    const req = request as unknown as NextRequest
    const admin = await requireAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRole(admin, ['owner'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const supabase = createClient()

    // Delete position (cascade will delete events)
    const { error } = await supabase
      .from('trading_positions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting position:', error)
      return NextResponse.json(
        { error: 'Failed to delete position', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/positions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
