'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { NotificationsBell } from '@/components/notifications-bell'
import {
  LayoutDashboard,
  Signal,
  User,
  CreditCard,
  Users,
  Shield,
  Rocket,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface MemberPortalLayoutProps {
  children: React.ReactNode
}

export function MemberPortalLayout({ children }: MemberPortalLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadUserData()
  }, [])

  function loadUserData() {
    try {
      // Just load user data for display - don't check auth or redirect
      // The page component handles authentication
      const userStr = localStorage.getItem('member_user')
      
      if (userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      // Call logout API to destroy session
      await fetch('/api/member/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear localStorage
    localStorage.removeItem('member_token')
    localStorage.removeItem('member_user')
    
    // Redirect to login
    window.location.href = '/member-login'
  }

  const navigation = [
    { name: 'Dashboard', href: '/member-portal/dashboard', icon: LayoutDashboard },
    { name: 'Signals', href: '/member-portal/signals', icon: Signal },
    { name: 'Account', href: '/member-portal/account', icon: User },
    { name: 'Subscription', href: '/member-portal/subscription', icon: CreditCard },
    { name: 'Affiliate', href: '/member-portal/affiliate', icon: Users },
    { name: '2FA Setup', href: '/member-portal/2fa-setup', icon: Shield },
    { name: 'Algo Trading', href: '/member-portal/algo-trading', icon: Rocket },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/member-portal/dashboard" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-white">
                ⚡ <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Nexural
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.slice(0, 4).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right Side - Notifications & User Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <NotificationsBell />

              {/* User Menu - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <p className="text-xs text-gray-400">Member</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <Menu className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-800">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              
              <div className="pt-4 border-t border-gray-700">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <p className="text-xs text-gray-400">Member</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Nexural Trading. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
