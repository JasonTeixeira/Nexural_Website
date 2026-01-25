'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MemberPortalNavigation } from './member-portal-navigation'

interface MemberPortalLayoutNewProps {
  children: React.ReactNode
}

export function MemberPortalLayoutNew({ children }: MemberPortalLayoutNewProps) {
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadMemberData()
  }, [])

  async function loadMemberData() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Allow access to settings while onboarding so the user can enable preferences.
        // NOTE: The settings page itself should persist the required preferences.
        const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
        const allowDuringOnboarding =
          pathname.startsWith('/member-portal/onboarding') || pathname.startsWith('/member-portal/settings')

        // SSOT onboarding gate: follow-admin + enable admin alerts.
        // Enforce via a dedicated onboarding page.
        try {
          const res = await fetch('/api/member/onboarding/status', { cache: 'no-store' })
          if (res.ok) {
            const status = await res.json()
            const onOnboardingPage = pathname.startsWith('/member-portal/onboarding')
            if (!status?.ok && !allowDuringOnboarding) {
              router.replace('/member-portal/onboarding')
              setLoading(false)
              return
            }
          }
        } catch (e) {
          // If the status endpoint fails, fail closed and force onboarding.
          if (!allowDuringOnboarding) {
            router.replace('/member-portal/onboarding')
            setLoading(false)
            return
          }
        }

        setMember(user)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Please log in</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Navigation */}
      <MemberPortalNavigation 
        subscriptionTier={member.subscription_tier || 'premium'}
        memberName={member.name || member.email}
      />

      {/* Main Content - with left margin for desktop sidebar */}
      <main className="lg:pl-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
