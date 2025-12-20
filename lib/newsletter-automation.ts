/**
 * Newsletter Automation Engine
 * Handles automated email sequence sending
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import freeNewsletterSequence from './email-templates/newsletter-sequences'
import paidNewsletterSequence from './email-templates/paid-newsletter-sequences'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

interface Subscriber {
  id: string
  email: string
  subscriber_type: 'free' | 'paid' | 'trial' | 'churned'
  sequence_step: number
  last_email_sent: string | null
  next_email_scheduled: string | null
  subscribed_at: string
}

/**
 * Get subscribers ready for next email
 */
export async function getSubscribersReadyForEmail() {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .lte('next_email_scheduled', now)
    .not('next_email_scheduled', 'is', null)
    .eq('status', 'active')
    .order('next_email_scheduled', { ascending: true })
  
  if (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }
  
  return data as Subscriber[]
}

/**
 * Send email to subscriber based on their sequence step
 */
export async function sendSequenceEmail(subscriber: Subscriber) {
  try {
    // Get appropriate email template
    const emailTemplate = getEmailTemplate(subscriber)
    
    if (!emailTemplate) {
      console.log(`No template for subscriber ${subscriber.email} at step ${subscriber.sequence_step}`)
      return { success: false, reason: 'no_template' }
    }
    
    // Replace variables in email
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
    const html = emailTemplate.html.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl)
    const text = emailTemplate.text.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl)
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Nexural Trading <signals@nexuraltrading.com>',
      to: subscriber.email,
      subject: emailTemplate.subject,
      html: html,
      text: text,
      headers: {
        'X-Entity-Ref-ID': subscriber.id,
      },
    })
    
    if (error) {
      console.error(`Error sending email to ${subscriber.email}:`, error)
      return { success: false, error }
    }
    
    // Record email in database
    await supabase
      .from('email_sequences')
      .insert({
        subscriber_id: subscriber.id,
        sequence_type: subscriber.subscriber_type,
        email_number: subscriber.sequence_step + 1,
        email_subject: emailTemplate.subject,
        status: 'sent',
        metadata: {
          resend_id: data?.id,
          sent_at: new Date().toISOString()
        }
      })
    
    // Update subscriber
    await supabase
      .from('newsletter_subscribers')
      .update({
        sequence_step: subscriber.sequence_step + 1,
        last_email_sent: new Date().toISOString(),
        total_emails_sent: (subscriber as any).total_emails_sent + 1
      })
      .eq('id', subscriber.id)
    
    console.log(`✅ Sent email to ${subscriber.email} (step ${subscriber.sequence_step + 1})`)
    
    return { success: true, emailId: data?.id }
    
  } catch (error) {
    console.error(`Error in sendSequenceEmail for ${subscriber.email}:`, error)
    return { success: false, error }
  }
}

/**
 * Get email template based on subscriber type and sequence step
 */
function getEmailTemplate(subscriber: Subscriber) {
  const { subscriber_type, sequence_step } = subscriber
  
  if (subscriber_type === 'free') {
    switch (sequence_step) {
      case 0:
        return freeNewsletterSequence.email1_education
      case 1:
        return freeNewsletterSequence.email2_value
      case 2:
        return freeNewsletterSequence.email3_social_proof
      case 3:
        return freeNewsletterSequence.email4_conversion
      default:
        return null // No more emails in sequence
    }
  }
  
  if (subscriber_type === 'paid' || subscriber_type === 'trial') {
    switch (sequence_step) {
      case 0:
        return paidNewsletterSequence.email1_welcome
      case 1:
        return paidNewsletterSequence.email2_setup
      case 2:
        return paidNewsletterSequence.email3_first_signal
      case 3:
        return paidNewsletterSequence.email4_community
      case 4:
        return paidNewsletterSequence.email5_performance
      default:
        return null // No more emails in sequence
    }
  }
  
  return null
}

/**
 * Process all subscribers ready for email
 */
export async function processNewsletterSequences() {
  console.log('🔄 Starting newsletter sequence processing...')
  
  const subscribers = await getSubscribersReadyForEmail()
  
  if (subscribers.length === 0) {
    console.log('✅ No subscribers ready for email')
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    }
  }
  
  console.log(`📧 Found ${subscribers.length} subscribers ready for email`)
  
  let sent = 0
  let failed = 0
  let skipped = 0
  
  for (const subscriber of subscribers) {
    const result = await sendSequenceEmail(subscriber)
    
    if (result.success) {
      sent++
    } else if (result.reason === 'no_template') {
      skipped++
    } else {
      failed++
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`✅ Processing complete: ${sent} sent, ${failed} failed, ${skipped} skipped`)
  
  return {
    processed: subscribers.length,
    sent,
    failed,
    skipped
  }
}

/**
 * Manually trigger email for specific subscriber
 */
export async function sendManualEmail(subscriberId: string) {
  const { data: subscriber, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('id', subscriberId)
    .single()
  
  if (error || !subscriber) {
    return { success: false, error: 'Subscriber not found' }
  }
  
  return await sendSequenceEmail(subscriber as Subscriber)
}

/**
 * Update subscriber type (e.g., when they upgrade to paid)
 */
export async function updateSubscriberType(
  email: string,
  newType: 'free' | 'paid' | 'trial' | 'churned'
) {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({
      subscriber_type: newType,
      sequence_step: 0, // Reset sequence
      last_email_sent: null,
      next_email_scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    })
    .eq('email', email)
    .select()
  
  if (error) {
    console.error('Error updating subscriber type:', error)
    return { success: false, error }
  }
  
  console.log(`✅ Updated ${email} to ${newType}`)
  return { success: true, data }
}
