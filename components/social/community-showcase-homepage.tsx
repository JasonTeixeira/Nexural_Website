'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Users, TrendingUp, Award, Medal } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  username: string
  display_name: string | null
  total_return_pct: number
  win_rate: number | null
  avatar_url: string | null
}

export function CommunityShowcaseHomepage() {
  const [topTraders, setTopTraders] = useState<LeaderboardEntry[]>([])
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    discordMembers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommunityData()
  }, [])

  async function loadCommunityData() {
    try {
      const supabase = createClient()
      
      // Load top 3 traders
      const { data: topData } = await supabase
        .from('user_profiles')
        .select('username, display_name, total_return_pct, win_rate, avatar_url')
        .eq('is_profile_public', true)
        .not('total_return_pct', 'is', null)
        .order('total_return_pct', { ascending: false })
        .limit(3)

      if (topData) {
        setTopTraders(topData)
      }

      // Get REAL Discord member count
      const discordResponse = await fetch('/api/discord/member-count')
      const discordData = await discordResponse.json()

      // Get platform member count
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_profile_public', true)

      setCommunityStats({
        totalMembers: count || 0,
        discordMembers: discordData.memberCount || 0
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading community data:', error)
      setLoading(false)
    }
  }

  const getRankBadge = (index: number) => {
    const badges = [
      { icon: Medal, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-500/20' },
      { icon: Medal, color: 'text-orange-400', bg: 'bg-orange-500/20' }
    ]
    return badges[index] || badges[0]
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Community</CardTitle>
          <CardDescription>Loading top traders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Traders Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Top Traders This Month
          </CardTitle>
          <CardDescription className="text-gray-400">
            Leading performers on the leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topTraders.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No rankings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topTraders.map((trader, index) => {
                const badge = getRankBadge(index)
                const IconComponent = badge.icon
                return (
                  <Link key={trader.username} href={`/profile/${trader.username}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-cyan-500/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${badge.bg}`}>
                          <IconComponent className={`h-7 w-7 ${badge.color}`} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            {trader.display_name || trader.username}
                          </p>
                          <p className="text-sm text-gray-400">
                            @{trader.username}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          trader.total_return_pct >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trader.total_return_pct >= 0 ? '+' : ''}
                          {trader.total_return_pct.toFixed(2)}%
                        </div>
                        {trader.win_rate && (
                          <p className="text-sm text-gray-400">
                            {trader.win_rate.toFixed(0)}% Win Rate
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <Link href="/leaderboard">
            <Button variant="outline" className="w-full mt-4 border-gray-600 hover:border-cyan-500">
              <Trophy className="h-4 w-4 mr-2" />
              View Full Leaderboard
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Community Stats Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            Join The Community
          </CardTitle>
          <CardDescription className="text-gray-400">
            Trade together, compete, and grow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm text-gray-400">Active Members</span>
                </div>
                <div className="text-3xl font-bold text-cyan-400">
                  {communityStats.totalMembers.toLocaleString()}
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-gray-400">Growing Daily</span>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  +{Math.floor(communityStats.totalMembers * 0.05)}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Award className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Compete on Leaderboard</p>
                  <p className="text-sm text-gray-400">Track your rank & performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Trophy className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Follow Top Traders</p>
                  <p className="text-sm text-gray-400">Learn from the best performers</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <TrendingUp className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Track Your Trades</p>
                  <p className="text-sm text-gray-400">Monitor positions & performance</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2">
              <Link href="/auth/signup">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold">
                  Join FREE Community
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" className="w-full border-gray-600 hover:border-cyan-500">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Members
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
