'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { ReferralDashboard } from '@/components/referral-dashboard'
import { getOrCreateReferralCode } from '@/lib/referral/referral-utils'
import { Activity } from 'lucide-react'

interface MemberData {
  id: string
  email: string
  name: string
}

export default function ReferralsPage() {
  const router = useRouter()
  const [member, setMember] = useState<MemberData | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthAndLoadData()
    }, 200)
    
    return () => clearTimeout(timer)
  }, [])

  async function checkAuthAndLoadData() {
    try {
      // Check localStorage for auth
      const token = localStorage.getItem('member_token')
      const userStr = localStorage.getItem('member_user')
      
      if (!token || !userStr) {
        router.push('/member-login')
        return
      }

      const localMember = JSON.parse(userStr)
      
      setMember({
        id: localMember.id || '1',
        email: localMember.email,
        name: localMember.name
      })

      // Get or create referral code
      const code = await getOrCreateReferralCode(
        localMember.id || '1',
        localMember.email
      )

      if (code) {
        setReferralCode(code.code)
      } else {
        setError(true)
      }

      setLoading(false)
    } catch (err) {
      console.error('Auth check error:', err)
      setError(true)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-lg">Loading your referral dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !referralCode || !member) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Referral Code</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load your referral code. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hero-gradient py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReferralDashboard 
          userId={member.id}
          userEmail={member.email}
          referralCode={referralCode}
        />
      </div>
    </div>
  )
}
