import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const authHeader = request.headers.get('authorization')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch watchlist item with images
    const { data: watchlistItem, error } = await supabase
      .from('watchlist')
      .select(`
        *,
        images:watchlist_images(*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    if (!watchlistItem) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ watchlistItem })
  } catch (error) {
    console.error('Error fetching watchlist item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const authHeader = request.headers.get('authorization')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      notes,
      tags,
      target_entry,
      target_exit,
      alert_price,
      company_name,
    } = body

    // Update watchlist item
    const { data: watchlistItem, error } = await supabase
      .from('watchlist')
      .update({
        notes,
        tags,
        target_entry,
        target_exit,
        alert_price,
        company_name,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    if (!watchlistItem) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ watchlistItem })
  } catch (error) {
    console.error('Error updating watchlist item:', error)
    return NextResponse.json(
      { error: 'Failed to update watchlist item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const authHeader = request.headers.get('authorization')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete associated images from storage first
    const { data: images } = await supabase
      .from('watchlist_images')
      .select('image_url')
      .eq('watchlist_id', params.id)

    if (images && images.length > 0) {
      // Extract file paths from URLs and delete from storage
      const filePaths = images.map(img => {
        const url = new URL(img.image_url)
        return url.pathname.split('/').slice(-1)[0]
      })

      await supabase.storage
        .from('watchlist-images')
        .remove(filePaths)
    }

    // Delete watchlist item (cascade will delete images records)
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting watchlist item:', error)
    return NextResponse.json(
      { error: 'Failed to delete watchlist item' },
      { status: 500 }
    )
  }
}
