'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Mail, 
  BarChart3, 
  Settings,
  Bell,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  subItems?: { label: string; href: string }[]
}

const navigationItems: NavItem[] = [
  {
    label: 'Overview',
    href: '/admin',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    label: 'Trading',
    href: '/admin/trading',
    icon: <TrendingUp className="h-4 w-4" />,
    subItems: [
      { label: 'IB Gateway', href: '/admin/ib-gateway' },
      { label: 'Signals', href: '/admin/signals' },
      { label: 'Positions', href: '/admin/positions' },
      { label: 'Paper Trading', href: '/admin/paper-trading-config' },
    ]
  },
  {
    label: 'Members',
    href: '/admin/members',
    icon: <Users className="h-4 w-4" />,
    subItems: [
      { label: 'All Members', href: '/admin/members' },
      { label: 'Activity', href: '/admin/analytics' },
    ]
  },
  {
    label: 'Marketing',
    href: '/admin/marketing',
    icon: <Mail className="h-4 w-4" />,
    subItems: [
      { label: 'Newsletter', href: '/admin/newsletter' },
      { label: 'Algo Waitlist', href: '/admin/algo-trading-waitlist' },
    ]
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    label: 'System',
    href: '/admin/system',
    icon: <Settings className="h-4 w-4" />,
    subItems: [
      { label: 'Market Data', href: '/admin/market-data' },
      { label: 'Data Pipeline', href: '/admin/data-pipeline' },
      { label: 'System Monitor', href: '/admin/system-monitor' },
      { label: 'Settings', href: '/admin/settings' },
    ]
  },
]

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [notifications] = useState(3)

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // best-effort
    } finally {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      router.push('/admin/login')
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return (pathname || '').startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <Link href="/admin" className="flex items-center space-x-3 mr-8">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="font-bold text-xl text-white hidden lg:inline-block">
            NEXURAL TRADING
          </span>
        </Link>

        {/* Main Navigation */}
        <div className="flex items-center space-x-1 flex-1">
          {navigationItems.map((item) => (
            item.subItems ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="hidden md:inline">{item.label}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                  <DropdownMenuLabel className="text-gray-400">{item.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {item.subItems.map((subItem) => (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link
                        href={subItem.href}
                        className={`cursor-pointer ${
                          pathname === subItem.href
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              </Link>
            )
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-xs flex items-center justify-center text-white">
                {notifications}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-gray-300 hover:text-white">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium">A</span>
                </div>
                <span className="hidden lg:inline">Admin</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
              <DropdownMenuLabel className="text-gray-400">Admin User</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer text-gray-300 hover:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
