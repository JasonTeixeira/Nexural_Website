import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { memberManagementService, MemberOnboarding } from '@/lib/member-management-service'
import { securityMiddleware, Validators } from '@/lib/security-middleware'
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

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const memberId = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || undefined
    const tier = searchParams.get('tier') || undefined
    const status = searchParams.get('status') || undefined
    const timeframe = searchParams.get('timeframe') as '7d' | '30d' | '90d' | '1y' || '30d'

    switch (action) {
      case 'list':
        // Use the centralized data service
        const result = await adminDataService.getMembers({
          search,
          tier,
          status,
          limit,
          offset
        })

        return NextResponse.json({
          success: true,
          members: result.members,
          total: result.total,
          limit,
          offset
        })

      case 'get':
        if (!memberId) {
          return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
        }

        const member = await adminDataService.getMemberById(memberId)
        
        if (!member) {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          member
        })

      case 'analytics':
        if (!memberId) {
          return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
        }

        const analytics = await memberManagementService.getMemberAnalytics(memberId, timeframe)
        
        return NextResponse.json({
          success: true,
          analytics
        })

      case 'segments':
        const segments = await memberManagementService.getMemberSegments()
        
        return NextResponse.json({
          success: true,
          segments
        })

      case 'segment-members':
        const segmentId = searchParams.get('segment_id')
        if (!segmentId) {
          return NextResponse.json({ error: 'Segment ID required' }, { status: 400 })
        }

        const segmentMembers = await memberManagementService.getMembersInSegment(segmentId)
        
        return NextResponse.json({
          success: true,
          members: segmentMembers
        })

      case 'activities':
        if (!memberId) {
          return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
        }

        const { data: activities, error: activitiesError } = await supabase
          .from('member_activities')
          .select('*')
          .eq('member_id', memberId)
          .order('timestamp', { ascending: false })
          .limit(50)

        if (activitiesError) {
          return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          activities: activities || []
        })

      case 'support-tickets':
        if (!memberId) {
          return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
        }

        const { data: tickets, error: ticketsError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('member_id', memberId)
          .order('created_at', { ascending: false })

        if (ticketsError) {
          return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          tickets: tickets || []
        })

      case 'overview':
        // Get member overview statistics
        const [
          { count: totalMembers },
          { count: activeMembers },
          { count: premiumMembers },
          { count: trialMembers }
        ] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact', head: true }),
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
          supabase.from('members').select('*', { count: 'exact', head: true }).in('subscription_tier', ['premium', 'enterprise']),
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trialing')
        ])

        // Get recent member activities
        const { data: recentActivities } = await supabase
          .from('member_activities')
          .select(`
            *,
            members(name, email)
          `)
          .order('timestamp', { ascending: false })
          .limit(10)

        // Get subscription distribution
        const { data: subscriptionStats } = await supabase
          .from('members')
          .select('subscription_tier, subscription_status')

        const tierDistribution = subscriptionStats?.reduce((acc: any, member) => {
          acc[member.subscription_tier] = (acc[member.subscription_tier] || 0) + 1
          return acc
        }, {}) || {}

        const statusDistribution = subscriptionStats?.reduce((acc: any, member) => {
          acc[member.subscription_status] = (acc[member.subscription_status] || 0) + 1
          return acc
        }, {}) || {}

        return NextResponse.json({
          success: true,
          overview: {
            total_members: totalMembers || 0,
            active_members: activeMembers || 0,
            premium_members: premiumMembers || 0,
            trial_members: trialMembers || 0,
            tier_distribution: tierDistribution,
            status_distribution: statusDistribution,
            recent_activities: recentActivities || []
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in members GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    switch (action) {
      case 'create':
        // Validate member data
        const memberValidation = validateMemberData(body.member)
        if (!memberValidation.isValid) {
          return NextResponse.json({ 
            error: 'Invalid member data',
            details: memberValidation.errors
          }, { status: 400 })
        }

        // Create new member
        const { data: newMember, error: createError } = await supabase
          .from('members')
          .insert({
            email: body.member.email,
            name: body.member.name,
            subscription_tier: body.member.subscription_tier || 'free',
            subscription_status: body.member.subscription_status || 'active',
            billing_cycle: body.member.billing_cycle || 'monthly',
            total_spent: 0,
            login_count: 0,
            preferences: {
              email_notifications: true,
              discord_notifications: false,
              trading_signals: true,
              newsletter: true,
              marketing_emails: false,
              sms_notifications: false,
              timezone: 'UTC',
              language: 'en',
              theme: 'light',
              dashboard_layout: 'detailed',
              signal_frequency: 'all',
              risk_tolerance: 'moderate'
            },
            tags: body.member.tags || [],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating member:', createError)
          return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
        }

        // Start onboarding process
        await MemberOnboarding.startOnboarding(newMember.id)

        return NextResponse.json({
          success: true,
          member: newMember,
          message: 'Member created successfully'
        })

      case 'update-subscription':
        const { memberId, subscriptionData } = body
        
        if (!memberId || !subscriptionData) {
          return NextResponse.json({ error: 'Member ID and subscription data required' }, { status: 400 })
        }

        const subscriptionResult = await memberManagementService.updateSubscription(memberId, subscriptionData)
        
        return NextResponse.json({
          success: subscriptionResult.success,
          message: subscriptionResult.success ? 'Subscription updated successfully' : subscriptionResult.error
        })

      case 'cancel-subscription':
        const { memberId: cancelMemberId, reason } = body
        
        if (!cancelMemberId) {
          return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
        }

        const cancelResult = await memberManagementService.cancelSubscription(cancelMemberId, reason)
        
        return NextResponse.json({
          success: cancelResult.success,
          message: cancelResult.success ? 'Subscription cancelled successfully' : cancelResult.error
        })

      case 'create-support-ticket':
        const ticketValidation = validateSupportTicketData(body.ticket)
        if (!ticketValidation.isValid) {
          return NextResponse.json({ 
            error: 'Invalid ticket data',
            details: ticketValidation.errors
          }, { status: 400 })
        }

        const ticketResult = await memberManagementService.createSupportTicket(body.ticket)
        
        return NextResponse.json({
          success: ticketResult.success,
          ticket: ticketResult.ticket,
          message: ticketResult.success ? 'Support ticket created successfully' : ticketResult.error
        })

      case 'update-support-ticket':
        const { ticketId, updates } = body
        
        if (!ticketId || !updates) {
          return NextResponse.json({ error: 'Ticket ID and updates required' }, { status: 400 })
        }

        const updateResult = await memberManagementService.updateSupportTicket(ticketId, updates)
        
        return NextResponse.json({
          success: updateResult.success,
          message: updateResult.success ? 'Support ticket updated successfully' : updateResult.error
        })

      case 'send-email':
        const { memberId: emailMemberId, template, data } = body
        
        if (!emailMemberId || !template || !data) {
          return NextResponse.json({ error: 'Member ID, template, and data required' }, { status: 400 })
        }

        const emailResult = await memberManagementService.sendMemberEmail(emailMemberId, template, data)
        
        return NextResponse.json({
          success: emailResult.success,
          message: emailResult.success ? 'Email sent successfully' : emailResult.error
        })

      case 'create-segment':
        const segmentValidation = validateSegmentData(body.segment)
        if (!segmentValidation.isValid) {
          return NextResponse.json({ 
            error: 'Invalid segment data',
            details: segmentValidation.errors
          }, { status: 400 })
        }

        const { data: newSegment, error: segmentError } = await supabase
          .from('member_segments')
          .insert({
            name: body.segment.name,
            description: body.segment.description,
            criteria: body.segment.criteria,
            member_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (segmentError) {
          return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          segment: newSegment,
          message: 'Member segment created successfully'
        })

      case 'bulk-action':
        const { memberIds, bulkAction, actionData } = body
        
        if (!memberIds || !Array.isArray(memberIds) || !bulkAction) {
          return NextResponse.json({ error: 'Member IDs and bulk action required' }, { status: 400 })
        }

        const bulkResults = await Promise.all(
          memberIds.map(async (memberId: string) => {
            switch (bulkAction) {
              case 'update_tier':
                return memberManagementService.updateSubscription(memberId, {
                  tier: actionData.tier,
                  status: 'active'
                })
              case 'add_tag':
                const member = await memberManagementService.getMember(memberId)
                if (member) {
                  const updatedTags = [...(member.tags || []), actionData.tag].filter((tag, index, arr) => arr.indexOf(tag) === index)
                  return memberManagementService.updateMemberProfile(memberId, { tags: updatedTags })
                }
                return { success: false, error: 'Member not found' }
              case 'send_email':
                return memberManagementService.sendMemberEmail(memberId, actionData.template, actionData.data)
              default:
                return { success: false, error: 'Invalid bulk action' }
            }
          })
        )

        const successful = bulkResults.filter(r => r.success).length
        const failed = bulkResults.length - successful

        return NextResponse.json({
          success: true,
          result: {
            total: bulkResults.length,
            successful,
            failed
          },
          message: `Bulk action completed: ${successful} successful, ${failed} failed`
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in members POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { memberId, updates, action } = body

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    switch (action) {
      case 'profile':
        // Validate updates
        const updateValidation = validateMemberData(updates, true)
        if (!updateValidation.isValid) {
          return NextResponse.json({ 
            error: 'Invalid update data',
            details: updateValidation.errors
          }, { status: 400 })
        }

        const profileResult = await memberManagementService.updateMemberProfile(memberId, updates)
        
        return NextResponse.json({
          success: profileResult.success,
          member: profileResult.member,
          message: profileResult.success ? 'Member profile updated successfully' : profileResult.error
        })

      case 'preferences':
        const preferencesResult = await memberManagementService.updateMemberPreferences(memberId, updates)
        
        return NextResponse.json({
          success: preferencesResult.success,
          message: preferencesResult.success ? 'Member preferences updated successfully' : preferencesResult.error
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in members PUT:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')
    const action = searchParams.get('action') || 'deactivate'

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    if (action === 'deactivate') {
      // Deactivate member instead of deleting
      const { error } = await supabase
        .from('members')
        .update({
          is_active: false,
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)

      if (error) {
        return NextResponse.json({ error: 'Failed to deactivate member' }, { status: 500 })
      }

      // Log activity
      await memberManagementService.logMemberActivity(memberId, 'account_deactivated', 'Member account deactivated by admin')

      return NextResponse.json({
        success: true,
        message: 'Member account deactivated successfully'
      })
    } else if (action === 'delete') {
      // Permanent deletion (use with caution)
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) {
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Member deleted permanently'
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in members DELETE:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Validation helpers
function validateMemberData(data: any, isUpdate: boolean = false): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isUpdate || data.email !== undefined) {
    if (!Validators.emailData({ email: data.email }).isValid) {
      errors.push('Invalid email format')
    }
  }

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.length < 1 || data.name.length > 100) {
      errors.push('Name must be 1-100 characters')
    }
  }

  if (data.subscription_tier && !['free', 'basic', 'premium', 'enterprise'].includes(data.subscription_tier)) {
    errors.push('Invalid subscription tier')
  }

  if (data.subscription_status && !['active', 'inactive', 'cancelled', 'past_due', 'trialing'].includes(data.subscription_status)) {
    errors.push('Invalid subscription status')
  }

  return { isValid: errors.length === 0, errors }
}

function validateSupportTicketData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.member_id) {
    errors.push('Member ID is required')
  }

  if (!data.subject || data.subject.length < 1 || data.subject.length > 200) {
    errors.push('Subject must be 1-200 characters')
  }

  if (!data.description || data.description.length < 1 || data.description.length > 2000) {
    errors.push('Description must be 1-2000 characters')
  }

  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Invalid priority level')
  }

  if (data.category && !['technical', 'billing', 'account', 'trading', 'general'].includes(data.category)) {
    errors.push('Invalid category')
  }

  return { isValid: errors.length === 0, errors }
}

function validateSegmentData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.length < 1 || data.name.length > 100) {
    errors.push('Segment name must be 1-100 characters')
  }

  if (!data.description || data.description.length < 1 || data.description.length > 500) {
    errors.push('Description must be 1-500 characters')
  }

  if (!data.criteria || typeof data.criteria !== 'object') {
    errors.push('Criteria object is required')
  }

  return { isValid: errors.length === 0, errors }
}
