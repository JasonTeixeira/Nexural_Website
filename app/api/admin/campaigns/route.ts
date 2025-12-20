import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/database-auth'
import { emailService } from '@/lib/email-service'
import { securityMiddleware, Validators } from '@/lib/security-middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Campaign interface
interface Campaign {
  id?: string
  name: string
  template_id: string
  subject: string
  from_name: string
  from_email: string
  reply_to: string
  segment_id?: string
  scheduled_at?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  ab_test_config?: {
    enabled: boolean
    subject_a: string
    subject_b: string
    split_percentage: number
    winner_criteria: 'open_rate' | 'click_rate'
  }
  drip_config?: {
    enabled: boolean
    trigger_event: 'signup' | 'purchase' | 'custom'
    delay_hours: number
    sequence_order: number
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request, {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 },
      auditLog: true
    })

    if (!security.success) {
      return security.response!
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const campaignId = searchParams.get('id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (action) {
      case 'list':
        // Get campaigns with filters
        let query = supabase
          .from('newsletter_campaigns')
          .select(`
            *,
            email_templates(name, subject),
            subscriber_segments(name)
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (status) {
          query = query.eq('status', status)
        }

        const { data: campaigns, error: campaignsError } = await query

        if (campaignsError) {
          console.error('Error fetching campaigns:', campaignsError)
          return NextResponse.json({ 
            error: 'Failed to fetch campaigns',
            campaigns: [],
            total: 0
          }, { status: 500 })
        }

        // Get total count
        const { count } = await supabase
          .from('newsletter_campaigns')
          .select('*', { count: 'exact', head: true })

        return NextResponse.json({
          success: true,
          campaigns: campaigns || [],
          total: count || 0,
          limit,
          offset
        })

      case 'get':
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }

        const { data: campaign, error: campaignError } = await supabase
          .from('newsletter_campaigns')
          .select(`
            *,
            email_templates(*),
            subscriber_segments(*)
          `)
          .eq('id', campaignId)
          .single()

        if (campaignError) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          campaign
        })

      case 'stats':
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }

        // Get campaign statistics
        const { data: campaignStats, error: statsError } = await supabase
          .from('newsletter_campaigns')
          .select('*')
          .eq('id', campaignId)
          .single()

        if (statsError) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        // Get detailed analytics
        const [
          { data: opens },
          { data: clicks },
          { data: bounces },
          { data: complaints }
        ] = await Promise.all([
          supabase.from('email_opens').select('*').eq('campaign_id', campaignId),
          supabase.from('email_clicks').select('*').eq('campaign_id', campaignId),
          supabase.from('email_bounces').select('*').eq('campaign_id', campaignId),
          supabase.from('email_complaints').select('*').eq('campaign_id', campaignId)
        ])

        const stats = {
          ...campaignStats,
          detailed_stats: {
            total_recipients: campaignStats.total_recipients || 0,
            delivered: campaignStats.delivered || 0,
            opened: opens?.length || 0,
            clicked: clicks?.length || 0,
            bounced: bounces?.length || 0,
            complained: complaints?.length || 0,
            open_rate: campaignStats.delivered > 0 ? ((opens?.length || 0) / campaignStats.delivered * 100).toFixed(2) : '0.00',
            click_rate: campaignStats.delivered > 0 ? ((clicks?.length || 0) / campaignStats.delivered * 100).toFixed(2) : '0.00',
            bounce_rate: campaignStats.total_recipients > 0 ? ((bounces?.length || 0) / campaignStats.total_recipients * 100).toFixed(2) : '0.00',
            complaint_rate: campaignStats.delivered > 0 ? ((complaints?.length || 0) / campaignStats.delivered * 100).toFixed(2) : '0.00'
          }
        }

        return NextResponse.json({
          success: true,
          stats
        })

      case 'performance':
        // Get performance overview for all campaigns
        const { data: allCampaigns, error: allCampaignsError } = await supabase
          .from('newsletter_campaigns')
          .select('*')
          .eq('status', 'sent')
          .order('sent_at', { ascending: false })
          .limit(10)

        if (allCampaignsError) {
          return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 })
        }

        const performanceData = await Promise.all(
          (allCampaigns || []).map(async (campaign) => {
            const [
              { data: opens },
              { data: clicks }
            ] = await Promise.all([
              supabase.from('email_opens').select('*').eq('campaign_id', campaign.id),
              supabase.from('email_clicks').select('*').eq('campaign_id', campaign.id)
            ])

            return {
              id: campaign.id,
              name: campaign.name,
              sent_at: campaign.sent_at,
              total_recipients: campaign.total_recipients || 0,
              delivered: campaign.delivered || 0,
              opened: opens?.length || 0,
              clicked: clicks?.length || 0,
              open_rate: campaign.delivered > 0 ? ((opens?.length || 0) / campaign.delivered * 100).toFixed(2) : '0.00',
              click_rate: campaign.delivered > 0 ? ((clicks?.length || 0) / campaign.delivered * 100).toFixed(2) : '0.00'
            }
          })
        )

        return NextResponse.json({
          success: true,
          performance: performanceData
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in campaigns GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 },
      validateInput: true,
      auditLog: true
    })

    if (!security.success) {
      return security.response!
    }

    const body = security.sanitizedBody
    const { action } = body

    switch (action) {
      case 'create':
        // Validate campaign data
        const campaignValidation = validateCampaignData(body.campaign)
        if (!campaignValidation.isValid) {
          return NextResponse.json({ 
            error: 'Invalid campaign data',
            details: campaignValidation.errors
          }, { status: 400 })
        }

        // Create new campaign
        const { data: newCampaign, error: createError } = await supabase
          .from('newsletter_campaigns')
          .insert({
            name: body.campaign.name,
            template_id: body.campaign.template_id,
            subject: body.campaign.subject,
            from_name: body.campaign.from_name,
            from_email: body.campaign.from_email,
            reply_to: body.campaign.reply_to,
            segment_id: body.campaign.segment_id,
            scheduled_at: body.campaign.scheduled_at,
            status: body.campaign.status || 'draft',
            ab_test_config: body.campaign.ab_test_config,
            drip_config: body.campaign.drip_config,
            created_by: security.user?.id
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating campaign:', createError)
          return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          campaign: newCampaign,
          message: 'Campaign created successfully'
        })

      case 'send':
        const { campaignId } = body
        
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }

        // Verify campaign exists and is ready to send
        const { data: campaignToSend, error: campaignError } = await supabase
          .from('newsletter_campaigns')
          .select('*')
          .eq('id', campaignId)
          .single()

        if (campaignError || !campaignToSend) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        if (!['draft', 'scheduled'].includes(campaignToSend.status)) {
          return NextResponse.json({ error: 'Campaign cannot be sent in current status' }, { status: 400 })
        }

        // Send campaign
        const sendResult = await emailService.sendCampaign(campaignId)

        return NextResponse.json({
          success: sendResult.success,
          result: sendResult,
          message: sendResult.success ? 'Campaign sent successfully' : 'Campaign sending failed'
        })

      case 'schedule':
        const { campaignId: scheduleId, scheduledAt } = body
        
        if (!scheduleId || !scheduledAt) {
          return NextResponse.json({ error: 'Campaign ID and scheduled time required' }, { status: 400 })
        }

        // Update campaign schedule
        const { error: scheduleError } = await supabase
          .from('newsletter_campaigns')
          .update({
            scheduled_at: scheduledAt,
            status: 'scheduled'
          })
          .eq('id', scheduleId)

        if (scheduleError) {
          return NextResponse.json({ error: 'Failed to schedule campaign' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Campaign scheduled successfully'
        })

      case 'duplicate':
        const { campaignId: duplicateId } = body
        
        if (!duplicateId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }

        // Get original campaign
        const { data: originalCampaign, error: originalError } = await supabase
          .from('newsletter_campaigns')
          .select('*')
          .eq('id', duplicateId)
          .single()

        if (originalError || !originalCampaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        // Create duplicate
        const { data: duplicatedCampaign, error: duplicateError } = await supabase
          .from('newsletter_campaigns')
          .insert({
            name: `${originalCampaign.name} (Copy)`,
            template_id: originalCampaign.template_id,
            subject: originalCampaign.subject,
            from_name: originalCampaign.from_name,
            from_email: originalCampaign.from_email,
            reply_to: originalCampaign.reply_to,
            segment_id: originalCampaign.segment_id,
            status: 'draft',
            ab_test_config: originalCampaign.ab_test_config,
            drip_config: originalCampaign.drip_config,
            created_by: security.user?.id
          })
          .select()
          .single()

        if (duplicateError) {
          return NextResponse.json({ error: 'Failed to duplicate campaign' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          campaign: duplicatedCampaign,
          message: 'Campaign duplicated successfully'
        })

      case 'test':
        const { campaignId: testId, testEmails } = body
        
        if (!testId || !testEmails || !Array.isArray(testEmails)) {
          return NextResponse.json({ error: 'Campaign ID and test emails required' }, { status: 400 })
        }

        // Get campaign and template
        const { data: testCampaign, error: testCampaignError } = await supabase
          .from('newsletter_campaigns')
          .select(`
            *,
            email_templates(*)
          `)
          .eq('id', testId)
          .single()

        if (testCampaignError || !testCampaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        // Send test emails
        const testResults = await Promise.all(
          testEmails.map(async (email: string) => {
            return emailService.sendEmail(
              email,
              `[TEST] ${testCampaign.subject}`,
              testCampaign.email_templates.html_content,
              testCampaign.email_templates.text_content,
              testCampaign.from_name,
              testCampaign.from_email,
              testCampaign.reply_to
            )
          })
        )

        const successful = testResults.filter(r => r.success).length
        const failed = testResults.length - successful

        return NextResponse.json({
          success: true,
          result: {
            sent: successful,
            failed,
            total: testResults.length
          },
          message: `Test emails sent: ${successful} successful, ${failed} failed`
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in campaigns POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 },
      validateInput: true,
      auditLog: true
    })

    if (!security.success) {
      return security.response!
    }

    const body = security.sanitizedBody
    const { campaignId, updates } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    // Validate updates
    const updateValidation = validateCampaignData(updates, true)
    if (!updateValidation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid update data',
        details: updateValidation.errors
      }, { status: 400 })
    }

    // Update campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('newsletter_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating campaign:', updateError)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: 'Campaign updated successfully'
    })

  } catch (error) {
    console.error('Error in campaigns PUT:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 },
      auditLog: true
    })

    if (!security.success) {
      return security.response!
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('id')

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    // Check if campaign can be deleted
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('status')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (['sending', 'sent'].includes(campaign.status)) {
      return NextResponse.json({ error: 'Cannot delete sent or sending campaigns' }, { status: 400 })
    }

    // Delete campaign
    const { error: deleteError } = await supabase
      .from('newsletter_campaigns')
      .delete()
      .eq('id', campaignId)

    if (deleteError) {
      console.error('Error deleting campaign:', deleteError)
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Error in campaigns DELETE:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Validation helper
function validateCampaignData(data: any, isUpdate: boolean = false): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.length < 1 || data.name.length > 200) {
      errors.push('Campaign name must be 1-200 characters')
    }
  }

  if (!isUpdate || data.subject !== undefined) {
    if (!data.subject || data.subject.length < 1 || data.subject.length > 300) {
      errors.push('Subject must be 1-300 characters')
    }
  }

  if (!isUpdate || data.from_name !== undefined) {
    if (!data.from_name || data.from_name.length < 1 || data.from_name.length > 100) {
      errors.push('From name must be 1-100 characters')
    }
  }

  if (!isUpdate || data.from_email !== undefined) {
    if (!Validators.emailData({ email: data.from_email }).isValid) {
      errors.push('Invalid from email format')
    }
  }

  if (data.reply_to && !Validators.emailData({ email: data.reply_to }).isValid) {
    errors.push('Invalid reply-to email format')
  }

  if (data.scheduled_at) {
    const scheduledDate = new Date(data.scheduled_at)
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      errors.push('Scheduled time must be in the future')
    }
  }

  return { isValid: errors.length === 0, errors }
}
