'use client'

import { usePathname } from 'next/navigation'
import { TopNavigation } from '@/components/admin/top-navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Hide admin navigation for login/auth pages
  const isAuthPage = pathname?.startsWith('/admin/login') || 
    pathname?.startsWith('/admin/forgot-password') ||
    pathname?.startsWith('/admin/reset-password')

  return (
    <div className="min-h-screen bg-gray-950">
      {!isAuthPage && <TopNavigation />}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
