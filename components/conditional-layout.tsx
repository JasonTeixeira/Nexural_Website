'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { FooterSection } from '@/components/footer-section'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide header and footer for admin routes (but NOT for login/forgot-password/reset-password)
  const isAdminRoute = pathname?.startsWith('/admin') && 
    !pathname.startsWith('/admin/login') && 
    !pathname.startsWith('/admin/forgot-password') &&
    !pathname.startsWith('/admin/reset-password')

  return (
    <>
      {!isAdminRoute && <Header />}
      <main role="main">
        {children}
      </main>
      {!isAdminRoute && <FooterSection />}
    </>
  )
}
