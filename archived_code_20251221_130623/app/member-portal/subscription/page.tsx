'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { CreditCard, Check, X, AlertCircle, Loader } from 'lucide-react'

interface MemberData {
  id: string
  email: string
  name: string
  subscription_tier: string
  subscription_status: string
  stripe_customer_id: string | null
  subscription_id: string | null
  created_at: string
}

const PLANS = {
  basic: {
    name: 'Basic',
    price: 49,
    features: [
      'Daily trading signals',
      'Discord access',
      'Email notifications',
      'Basic support'
    ]
  },
  premium: {
    name: 'Premium',
    price: 99,
    features: [
      'Real-time trading signals',
      'Priority Discord access',
      'SMS notifications',
      'Advanced analytics',
      'Priority support',
      'Live trading integration'
    ]
  },
  pro: {
    name: 'Pro',
    price: 199,
    features: [
      'Everything in Premium',
      'Automated trading',
      'Custom strategies',
      'Dedicated account manager',
      '24/7 priority support',
      'API access'
    ]
  }
}

export default function SubscriptionPage() {
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadMemberData()
  }, [])

  async function loadMemberData() {
    try {
      const supabase = createClient()
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/member-login')
        return
      }

      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .single()

      if (memberError) {
        setError('Could not load subscription data')
        setLoading(false)
        return
      }

      setMember(memberData)
      setLoading(false)
    } catch (err) {
      setError('An error occurred')
      setLoading(false)
    }
  }

  async function handleUpgrade(tier: string) {
    if (!member) return

    setProcessing(true)
    setError(null)

    try {
      // Call Stripe checkout API
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          customerId: member.stripe_customer_id,
          email: member.email
        })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Could not create checkout session')
        setProcessing(false)
      }
    } catch (err) {
      setError('An error occurred')
      setProcessing(false)
    }
  }

  async function handleManageBilling() {
    if (!member || !member.stripe_customer_id) return

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: member.stripe_customer_id
        })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Could not access billing portal')
        setProcessing(false)
      }
    } catch (err) {
      setError('An error occurred')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white text-lg">Loading subscription...</p>
        </div>
      </div>
    )
  }

  if (error && !member) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/member-portal/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentTier = member?.subscription_tier || 'basic'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">💳 Subscription Management</h1>
              <p className="text-gray-300">Manage your plan and billing</p>
            </div>
            <button
              onClick={() => router.push('/member-portal/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold capitalize text-purple-400">{currentTier}</p>
              <p className="text-gray-400 mt-1">
                ${PLANS[currentTier as keyof typeof PLANS].price}/month
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              member?.subscription_status === 'active' ? 'bg-green-900/30 text-green-400 border border-green-700' :
              member?.subscription_status === 'trial' ? 'bg-blue-900/30 text-blue-400 border border-blue-700' :
              'bg-gray-700 text-gray-300 border border-gray-600'
            }`}>
              {member?.subscription_status.toUpperCase()}
            </span>
          </div>

          {member?.stripe_customer_id && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleManageBilling}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-semibold flex items-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                {processing ? 'Loading...' : 'Manage Billing & Payment Methods'}
              </button>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <h2 className="text-2xl font-semibold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([tier, plan]) => {
            const isCurrent = tier === currentTier
            const isUpgrade = 
              (tier === 'premium' && currentTier === 'basic') ||
              (tier === 'pro' && (currentTier === 'basic' || currentTier === 'premium'))

            return (
              <div
                key={tier}
                className={`bg-gray-800 rounded-lg p-6 border-2 ${
                  isCurrent ? 'border-purple-500' : 'border-gray-700'
                } relative`}
              >
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      CURRENT
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full bg-gray-700 text-gray-400 px-6 py-3 rounded-md font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(tier)}
                    disabled={processing}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-semibold"
                  >
                    {processing ? 'Processing...' : 'Upgrade Now'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-700 text-gray-400 px-6 py-3 rounded-md font-semibold cursor-not-allowed"
                  >
                    Downgrade Not Available
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Billing Info */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Billing Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Next Billing Date</span>
              <span className="font-semibold">
                {member?.subscription_status === 'active' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Payment Method</span>
              <span className="font-semibold">
                {member?.stripe_customer_id ? 'Card on file' : 'No payment method'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-400">Member Since</span>
              <span className="font-semibold">
                {member?.created_at ? new Date(member.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
