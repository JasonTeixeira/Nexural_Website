import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { adminDataService } from '@/lib/admin-data-service'
import { requireAdminSession, extractToken } from '@/lib/server-session-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)
    const auth = await requireAdminSession(token)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use centralized data service
    const result = await adminDataService.getSignals({ limit: 50 })
    const templates = await adminDataService.getSignalTemplates()

    return NextResponse.json({ 
      success: true,
      signals: result.signals || [],
      templates: templates || {},
      total: result.total
    })
  } catch (error) {
    console.error('Error in GET /api/admin/signals:', error)
    return NextResponse.json({ 
      signals: [],
      error: 'Failed to fetch signals'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)
    const auth = await requireAdminSession(token)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    // Validate and check action field
    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Valid action is required' },
        { status: 400 }
      )
    }

    if (!['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "stop"' },
        { status: 400 }
      )
    }

    if (action === 'start' || action === 'stop') {
      // Update signal generator status in system config
      const { error } = await supabase
        .from('system_config')
        .upsert({
          config_key: 'SIGNAL_GENERATOR_ACTIVE',
          config_value: action === 'start' ? 'true' : 'false',
          config_type: 'boolean',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating signal generator status:', error)
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        message: `Signal generator ${action}ed successfully`,
        status: action === 'start' ? 'running' : 'stopped'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/signals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
