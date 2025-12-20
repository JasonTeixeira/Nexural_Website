'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { MemberPortalLayout } from '@/components/member-portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Activity, DollarSign, Signal, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { SwingPositionsWidget } from '@/components/swing-positions-widget'
import { DiscordConnectionCard } from '@/components/discord-connection-card'
import { AlgoTradingHeroBanner } from '@/components/algo-trading-hero-banner'
import { toast } from '@/hooks/use-toast'

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

interface SignalData {
  id: string
  symbol: string
  action: string
  entry_price: number
  target_price: number
  stop_loss: number
  confidence: number
  status: string
  created_at: string
}

export default function UnifiedMemberDashboard() {
  const [member, setMember] = useState<MemberData | null>(null)
  const [signals, setSignals] = useState<SignalData[]>([])
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

      // Get recent signals
      const { data: signalsData, error: signalsError } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!signalsError && signalsData) {
        setSignals(signalsData)
      }

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
      <MemberPortalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </MemberPortalLayout>
    )
  }

  if (error || !member) {
    return (
      <MemberPortalLayout>
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
                <Link href="/member-login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MemberPortalLayout>
    )
  }

  const activeSignals = signals.filter(s => s.status === 'active').length
  const totalSignals = signals.length
  const memberSince = new Date(member.created_at)
  const daysSinceMember = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <MemberPortalLayout>
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
              <Link href="/member-portal/signals">View All Signals</Link>
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
              <CardTitle className="text-sm font-medium text-gray-400">Active Signals</CardTitle>
              <div className="p-2 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-colors">
                <Signal className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold data-value">{activeSignals}</div>
              <p className="text-sm text-gray-500 mt-1">
                {totalSignals} total signals
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

        {/* Swing Positions Widget */}
        <SwingPositionsWidget />

        {/* Signals & Activity Tabs */}
        <Tabs defaultValue="signals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="signals">Recent Signals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-2xl">Recent Trading Signals</CardTitle>
                <CardDescription>
                  Latest signals from our trading system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {signals.length === 0 ? (
                  <div className="text-center py-8">
                    <Signal className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No signals yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Signals will appear here when generated
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signals.map((signal) => (
                      <div
                        key={signal.id}
                        className="glass-card rounded-xl p-6 hover:border-white/20 transition-all animate-fade-in"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            signal.action === 'BUY' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                          }`}>
                            {signal.action === 'BUY' ? (
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{signal.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {signal.action} @ ${signal.entry_price}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Target: ${signal.target_price}</p>
                          <p className="text-sm text-muted-foreground">
                            Stop: ${signal.stop_loss}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={signal.status === 'active' ? 'default' : 'secondary'}>
                            {signal.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(signal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
              <Link href="/member-portal/signals">View All Signals</Link>
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
    </MemberPortalLayout>
  )
}
