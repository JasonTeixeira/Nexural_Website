/**
 * Development Mode Stripe Webhook Handler
 * 
 * ⚠️ WARNING: This is ONLY for development/testing purposes!
 * DO NOT use in production without a real webhook secret.
 * 
 * This allows webhook testing while you obtain the real secret from Stripe.
 */

import { NextRequest } from 'next/server';

export const DEV_MODE_ENABLED = process.env.NODE_ENV === 'development' && 
  process.env.STRIPE_WEBHOOK_SECRET?.includes('placeholder');

export function logDevModeWarning() {
  if (DEV_MODE_ENABLED) {
    console.warn('\n' + '='.repeat(70));
    console.warn('⚠️  DEVELOPMENT MODE: Stripe Webhook Secret is Placeholder');
    console.warn('='.repeat(70));
    console.warn('');
    console.warn('🚨 SECURITY WARNING:');
    console.warn('   - Webhook signature verification is DISABLED');
    console.warn('   - This is NOT secure for production use');
    console.warn('   - Get real webhook secret from Stripe Dashboard');
    console.warn('');
    console.warn('📝 To fix:');
    console.warn('   1. Go to: https://dashboard.stripe.com/webhooks');
    console.warn('   2. Get your webhook signing secret (starts with whsec_)');
    console.warn('   3. Update STRIPE_WEBHOOK_SECRET in .env.local');
    console.warn('');
    console.warn('='.repeat(70) + '\n');
  }
}

export function canBypassWebhookVerification(req: NextRequest): boolean {
  if (!DEV_MODE_ENABLED) {
    return false;
  }

  // Only allow bypass from localhost in development
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
              req.headers.get('x-real-ip') || 
              'unknown';
  
  const isLocalhost = ip === '127.0.0.1' || 
                      ip === '::1' || 
                      ip === 'unknown' || 
                      ip.includes('localhost');

  if (isLocalhost) {
    console.log('🔓 DEV MODE: Bypassing webhook signature verification');
    console.log('   Source IP:', ip);
    return true;
  }

  return false;
}

export function parseWebhookBodyDev(body: string): any {
  try {
    return JSON.parse(body);
  } catch (error) {
    console.error('Failed to parse webhook body:', error);
    return null;
  }
}

export function createDevModeEvent(body: any): any {
  // In dev mode, the body should already be the event object
  // or we need to extract it from the request
  if (body.type && body.data) {
    return body;
  }

  // If it's wrapped, unwrap it
  if (body.event) {
    return body.event;
  }

  return body;
}

export function validateDevModeEvent(event: any): boolean {
  if (!event || typeof event !== 'object') {
    console.error('Invalid event object');
    return false;
  }

  if (!event.type) {
    console.error('Event missing type field');
    return false;
  }

  if (!event.data || !event.data.object) {
    console.error('Event missing data.object field');
    return false;
  }

  return true;
}

// Log dev mode status on import
if (DEV_MODE_ENABLED) {
  logDevModeWarning();
}
