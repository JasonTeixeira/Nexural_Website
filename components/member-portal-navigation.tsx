'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Signal, 
  Target, 
  Rocket, 
  Settings, 
  User,
  Menu,
  X,
  LogOut,
  Bell,
  Wallet,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NavigationProps {
  subscriptionTier: string
  memberName: string
}

export function MemberPortalNavigation({ subscriptionTier, memberName }: NavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const hasAlgoAccess = subscriptionTier === 'algo' || subscriptionTier === 'ALGO'

  const navItems = [
    {
      name: 'Dashboard',
      href: '/member-portal',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'My Portfolio',
      href: '/member-portal/portfolio',
      icon: Wallet,
      badge: null
    },
    {
      name: 'Analytics',
      href: '/member-portal/analytics',
      icon: BarChart3,
      badge: null
    },
    {
      name: 'Signals',
      href: '/member-portal/signals',
      icon: Signal,
      badge: null
    },
    {
      name: 'Swing Positions',
      href: '/member-portal/swing-positions',
      icon: Target,
      badge: null
    },
    {
      name: 'Algo Trading',
      href: '/member-portal/algo-trading',
      icon: Rocket,
      badge: hasAlgoAccess ? null : 'Premium',
      locked: !hasAlgoAccess
    },
    {
      name: 'Profile',
      href: '/member-portal/profile',
      icon: User,
      badge: null
    },
    {
      name: 'Settings',
      href: '/member-portal/settings',
      icon: Settings,
      badge: null
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('member_token')
    localStorage.removeItem('member_user')
    window.location.href = '/member-login'
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-card border-r border-white/10">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-white/10">
            <Link href="/member-portal" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold">Nexural</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.locked ? '#' : item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                    ${item.locked ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={(e) => {
                    if (item.locked) {
                      e.preventDefault()
                    }
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {memberName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{memberName}</p>
                <p className="text-xs text-gray-400 capitalize">{subscriptionTier} Plan</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-gray-400 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/member-portal" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold">Nexural</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-card border-b border-white/10 shadow-2xl">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.locked ? '#' : item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-gray-300 hover:bg-white/5'
                      }
                      ${item.locked ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={(e) => {
                      if (item.locked) {
                        e.preventDefault()
                      } else {
                        setMobileMenuOpen(false)
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white mt-4"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-16" />
    </>
  )
}
