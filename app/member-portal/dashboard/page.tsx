'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { SSOTPositionsWidget } from '@/components/positions/ssot-positions-widget'
import { DiscordConnectionCard } from '@/components/discord-connection-card'
import { AlgoTradingHeroBanner } from '@/components/algo-trading/algo-trading-hero-banner'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface MemberData {
  id: string
  email: string
  name: string
  subscription_tier: string
  subscription_status: string
  discord_user_id: string | null
  discord_username: string | null
  created_at: string
}

export default function UnifiedMemberDashboard() {
  const router = useRouter()
  const [member, setMember] = useState<MemberData | null>(null)
  // Legacy note: the previous dashboard displayed `signals` (separate table/model).
  // SSOT stance: signals are represented by canonical positions + events/feed.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMemberData()
    
    // Check for Discord connection success/error
    const params = new URLSearchParams(window.location.search)
    if (params.get('discord_connected') === 'true') {
      toast({
        title: 'Discord Connected!',
        description: 'Your Discord account has been successfully connected.',
      })
      // Clean up URL
      window.history.replaceState({}, '', '/member-portal/dashboard')
    } else if (params.get('discord_error')) {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect Discord. Please try again.',
        variant: 'destructive'
      })
      window.history.replaceState({}, '', '/member-portal/dashboard')
    }
  }, [])

  // SSOT onboarding gate: user must follow admin + enable admin alerts.
  // Canonical status endpoint: /api/member/onboarding/status
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/member/onboarding/status', { cache: 'no-store' })
        if (res.status === 401) return
        const json = await res.json().catch(() => null)
        if (json && json.ok === false) {
          router.replace('/member-portal/onboarding')
        }
      } catch {
        // Fail open on transient onboarding status errors to avoid blocking login.
      }
    })()
  }, [router])

  async function loadMemberData() {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setError('Please log in to access your dashboard')
        setLoading(false)
        return
      }

      // Get member data
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .single()

      if (memberError) {
        setError('Could not load member data')
        setLoading(false)
        return
      }

      setMember(memberData)

      setLoading(false)
    } catch (err) {
      setError('An error occurred loading your dashboard')
      setLoading(false)
    }
  }

  const handleDiscordConnectionChange = () => {
    // Reload member data to get updated Discord status
    loadMemberData()
  }

  if (loading) {
    return (
      <MemberPortalLayoutNew>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  if (error || !member) {
    return (
      <MemberPortalLayoutNew>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Access Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error || 'Unable to load dashboard'}</p>
              <Button asChild>
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  const memberSince = new Date(member.created_at)
  const daysSinceMember = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <MemberPortalLayoutNew>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {member.name}!</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="capitalize">
                {member.subscription_tier} Member
              </Badge>
              <Badge variant="outline" className="capitalize">
                {member.subscription_status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/member-portal/account">Account Settings</Link>
            </Button>
            <Button asChild>
              <Link href="/member-portal/feed">View Feed</Link>
            </Button>
          </div>
        </div>

        {/* Algo Trading Hero Banner - PROMINENT POSITION */}
        <AlgoTradingHeroBanner
          subscriptionTier={member.subscription_tier}
          memberId={member.id}
          isOnWaitlist={false}
          totalWaiting={1247}
        />

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Subscription</CardTitle>
              <div className="p-2 bg-indigo-600/20 rounded-lg group-hover:bg-indigo-600/30 transition-colors">
                <Activity className="h-5 w-5 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold data-value capitalize">{member.subscription_status}</div>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {member.subscription_tier} Plan
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">SSOT Feed</CardTitle>
              <div className="p-2 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-colors">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold data-value">Live</div>
              <p className="text-sm text-gray-500 mt-1">
                Admin + followed events
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Discord</CardTitle>
              <div className={`p-2 rounded-lg transition-colors ${
                member.discord_user_id 
                  ? 'bg-green-600/20 group-hover:bg-green-600/30' 
                  : 'bg-gray-600/20 group-hover:bg-gray-600/30'
              }`}>
                <Activity className={`h-5 w-5 ${member.discord_user_id ? 'text-green-400' : 'text-gray-400'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold data-value">
                {member.discord_user_id ? 'Connected' : 'Not Connected'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {member.discord_user_id ? 'Receiving signals' : 'Connect to receive'}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Member Since</CardTitle>
              <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold data-value">
                {memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {daysSinceMember} days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Discord Connection Card */}
        <DiscordConnectionCard
          memberId={member.id}
          discordUserId={member.discord_user_id}
          discordUsername={member.discord_username}
          onConnectionChange={handleDiscordConnectionChange}
        />

        {/* SSOT Positions Widget */}
        <SSOTPositionsWidget />

        {/* Activity Tabs */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-2xl">Recent Activity</CardTitle>
                <CardDescription>
                  Your account activity and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {memberSince.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {member.discord_user_id && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <Activity className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Discord Connected</p>
                        <p className="text-sm text-muted-foreground">
                          {member.discord_username}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/member-portal/feed">View Feed</Link>
            </Button>
            {!member.discord_user_id && (
              <Button asChild variant="outline">
                <Link href="#discord">Connect Discord</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/member-portal/subscription">Manage Subscription</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/member-portal/account">Account Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MemberPortalLayoutNew>
  )
}
