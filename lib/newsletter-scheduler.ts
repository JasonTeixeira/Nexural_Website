import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ScheduledCampaign {
  id: string
  title: string
  subject: string
  content: string
  template_type: string
  scheduled_date: string
  status: string
}

interface NewsletterSubscriber {
  email: string
  status: string
}

export class NewsletterScheduler {
  
  // Process all scheduled campaigns that are due
  static async processScheduledCampaigns(): Promise<{
    processed: number
    successful: number
    failed: number
    errors: string[]
  }> {
    const now = new Date().toISOString()
    const errors: string[] = []
    let processed = 0
    let successful = 0
    let failed = 0

    try {
      // Get all campaigns scheduled for now or earlier that haven't been sent
      const { data: campaigns, error: campaignsError } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_date', now)

      if (campaignsError) {
        errors.push(`Failed to fetch scheduled campaigns: ${campaignsError.message}`)
        return { processed: 0, successful: 0, failed: 0, errors }
      }

      if (!campaigns || campaigns.length === 0) {
        return { processed: 0, successful: 0, failed: 0, errors: [] }
      }

      // Process each scheduled campaign
      for (const campaign of campaigns) {
        processed++
        
        try {
          const result = await this.sendScheduledCampaign(campaign)
          if (result.success) {
            successful++
          } else {
            failed++
            errors.push(`Campaign ${campaign.id}: ${result.error}`)
          }
        } catch (error) {
          failed++
          errors.push(`Campaign ${campaign.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return { processed, successful, failed, errors }
      
    } catch (error) {
      errors.push(`Scheduler error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { processed: 0, successful: 0, failed: 0, errors }
    }
  }

  // Send a specific scheduled campaign
  private static async sendScheduledCampaign(campaign: ScheduledCampaign): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Update campaign status to sending
      await supabase
        .from('newsletter_campaigns')
        .update({ 
          status: 'sending',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id)

      // Get template for the campaign
      const { data: template, error: templateError } = await supabase
        .from('newsletter_templates')
        .select('*')
        .eq('template_type', campaign.template_type)
        .eq('is_active', true)
        .single()

      if (templateError || !template) {
        await this.markCampaignFailed(campaign.id, 'Template not found or inactive')
        return { success: false, error: 'Template not found or inactive' }
      }

      // Get active subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('status', 'active')

      if (subscribersError) {
        await this.markCampaignFailed(campaign.id, 'Failed to fetch subscribers')
        return { success: false, error: 'Failed to fetch subscribers' }
      }

      if (!subscribers || subscribers.length === 0) {
        await this.markCampaignFailed(campaign.id, 'No active subscribers found')
        return { success: false, error: 'No active subscribers found' }
      }

      // Process template content
      const processedContent = this.processTemplateContent(
        campaign.content, 
        template.html_content, 
        template.variables
      )

      // Send emails in batches
      const batchSize = 50
      let successCount = 0
      let failureCount = 0

      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (subscriber) => {
          try {
            // Create unsubscribe URL
            const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
            
            // Replace unsubscribe URL in content
            const finalContent = processedContent.replace(/{{unsubscribe_url}}/g, unsubscribeUrl)
            
            // Send email
            await emailService.sendNewsletterCampaign(
              subscriber.email,
              campaign.subject,
              finalContent,
              this.stripHtml(finalContent)
            )
            
            return { success: true }
          } catch (error) {
            console.error(`Failed to send email to ${subscriber.email}:`, error)
            return { success: false }
          }
        })

        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++
          } else {
            failureCount++
          }
        })

        // Small delay between batches
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Update campaign with final status
      const finalStatus = failureCount === 0 ? 'sent' : (successCount > 0 ? 'sent' : 'failed')
      
      await supabase
        .from('newsletter_campaigns')
        .update({ 
          status: finalStatus,
          sent_date: new Date().toISOString(),
          recipient_count: successCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id)

      return { success: true }

    } catch (error) {
      await this.markCampaignFailed(campaign.id, error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Mark campaign as failed
  private static async markCampaignFailed(campaignId: string, errorMessage: string): Promise<void> {
    try {
      await supabase
        .from('newsletter_campaigns')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
      
      console.error(`Campaign ${campaignId} failed: ${errorMessage}`)
    } catch (error) {
      console.error(`Failed to mark campaign ${campaignId} as failed:`, error)
    }
  }

  // Process template content with variables
  private static processTemplateContent(campaignContent: string, templateHtml: string, templateVariables: any): string {
    let processedContent = templateHtml

    // Replace template variables with campaign content
    const variables = typeof templateVariables === 'string' 
      ? JSON.parse(templateVariables) 
      : templateVariables

    // Common replacements
    const replacements = {
      '{{week_date}}': new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{month_year}}': new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }),
      '{{announcement_date}}': new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{brief_date}}': new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{analysis_date}}': new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{update_date}}': new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{education_date}}': new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{event_date}}': new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{market_summary}}': campaignContent,
      '{{monthly_summary}}': campaignContent,
      '{{announcement_content}}': campaignContent,
      '{{market_snapshot}}': campaignContent,
      '{{key_signals}}': campaignContent,
      '{{main_content}}': campaignContent,
      '{{executive_summary}}': campaignContent,
      '{{market_overview}}': campaignContent,
      '{{event_description}}': campaignContent,
      '{{upgrade_url}}': `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
      '{{manage_preferences_url}}': `${process.env.NEXT_PUBLIC_APP_URL}/preferences`
    }

    // Apply replacements
    Object.entries(replacements).forEach(([key, value]) => {
      processedContent = processedContent.replace(new RegExp(key, 'g'), value)
    })

    return processedContent
  }

  // Strip HTML for plain text version
  private static stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Get scheduled campaigns summary
  static async getScheduledCampaignsSummary(): Promise<{
    total: number
    upcoming: number
    overdue: number
    campaigns: any[]
  }> {
    try {
      const now = new Date().toISOString()
      
      const { data: campaigns, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })

      if (error) {
        throw error
      }

      const total = campaigns?.length || 0
      const overdue = campaigns?.filter(c => c.scheduled_date < now).length || 0
      const upcoming = total - overdue

      return {
        total,
        upcoming,
        overdue,
        campaigns: campaigns || []
      }
    } catch (error) {
      console.error('Error getting scheduled campaigns summary:', error)
      return { total: 0, upcoming: 0, overdue: 0, campaigns: [] }
    }
  }
}
