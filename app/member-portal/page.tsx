'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Canonical member portal entry.
 *
 * We keep /member-portal as a stable entry URL, but always route users to the
 * real dashboard page which handles data loading + onboarding checks.
 */
export default function MemberPortalIndexRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/member-portal/dashboard')
  }, [router])

  return null
}
