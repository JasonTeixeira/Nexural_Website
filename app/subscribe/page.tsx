import { redirect } from 'next/navigation'

// Legacy compatibility: /subscribe is used in a few OAuth flows.
// Canonical upsell/pricing page is /pricing.
export default function SubscribeRedirect() {
  redirect('/pricing')
}
