'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy,
  TrendingUp,
  Target,
  Award,
  Users,
  ArrowLeft,
  Crown,
  Medal,
  Star
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio?: string | null
  return_pct: number
  win_rate: number
  total_positions: number
  follower_count: number
}

type LeaderboardCategory = 'returns' | 'win_rate' | 'consistency'
type TimePeriod = 'd30' | 'd60' | 'd90'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<LeaderboardCategory>('returns')
  const [period, setPeriod] = useState<TimePeriod>('d30')
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null)

  const timeframeDays = useMemo(() => {
    if (period === 'd60') return 60
    if (period === 'd90') return 90
    return 30
  }, [period])

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true)

      // SSOT: derive from rollups read model
      const res = await fetch(`/api/member/leaderboard?timeframe=${timeframeDays}&limit=100`)
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Failed to load leaderboard')

      let items: LeaderboardEntry[] = (j.items || []).map((it: any) => ({
        rank: it.rank,
        user_id: it.user_id,
        username: it.username || 'unknown',
        display_name: it.display_name || null,
        avatar_url: it.avatar_url || null,
        bio: it.bio || null,
        return_pct: Number(it.return_pct || 0),
        win_rate: Number(it.win_rate || 0),
        total_positions: Number(it.total_positions || 0),
        follower_count: Number(it.follower_count || 0),
      }))

      // Category sorting (v1 UI):
      // - returns uses return_pct
      // - win_rate uses win_rate
      // - consistency uses total_positions (proxy)
      if (category === 'win_rate') {
        items = [...items].sort((a, b) => b.win_rate - a.win_rate)
      } else if (category === 'consistency') {
        items = [...items].sort((a, b) => b.total_positions - a.total_positions)
      }

      // Re-rank after sorting
      items = items.map((it, idx) => ({ ...it, rank: idx + 1 }))
      setLeaderboard(items)
      setCurrentUserRank(null)

      setLoading(false)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      setLoading(false)
    }
  }, [category, timeframeDays])

  useEffect(() => {
    void loadLeaderboard()
  }, [loadLeaderboard])

  function getRankIcon(rank: number) {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground font-bold">#{rank}</span>
  }

  function getRankBadge(rank: number) {
    if (rank === 1) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">🏆 Champion</Badge>
    if (rank === 2) return <Badge className="bg-muted text-muted-foreground border-border">🥈 Runner-up</Badge>
    if (rank === 3) return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/50">🥉 3rd Place</Badge>
    if (rank <= 10) return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">⭐ Top 10</Badge>
    if (rank <= 50) return <Badge variant="secondary">Top 50</Badge>
    return null
  }

  function getCategoryValue(entry: LeaderboardEntry) {
    if (category === 'returns') return `${entry.return_pct >= 0 ? '+' : ''}${entry.return_pct.toFixed(2)}%`
    if (category === 'win_rate') return `${entry.win_rate.toFixed(1)}%`
    return `${entry.total_positions} positions`
  }

  function getCategoryLabel() {
    if (category === 'returns') return 'Return'
    if (category === 'win_rate') return 'Win Rate'
    return 'Positions'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-900/20 via-cyan-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-10 w-10 text-yellow-400" />
                <h1 className="text-4xl font-bold">
                  <span className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Leaderboard
                  </span>
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Top performing traders in the community
              </p>
            </div>

            {/* Current User Rank */}
            {currentUserRank && (
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">#{currentUserRank.rank}</div>
                      <div className="text-xs text-muted-foreground">Your Rank</div>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div>
                      <div className="font-semibold text-white">
                        {currentUserRank.display_name || currentUserRank.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getCategoryValue(currentUserRank)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Tabs */}
          <Tabs value={category} onValueChange={(v) => setCategory(v as LeaderboardCategory)}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="returns">
                <TrendingUp className="h-4 w-4 mr-2" />
                Returns
              </TabsTrigger>
              <TabsTrigger value="win_rate">
                <Target className="h-4 w-4 mr-2" />
                Win Rate
              </TabsTrigger>
              <TabsTrigger value="consistency">
                <Award className="h-4 w-4 mr-2" />
                Consistency
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Time Period Buttons */}
            <div className="flex flex-wrap gap-2">
            <Button
                variant={period === 'd30' ? 'default' : 'outline'}
              size="sm"
                onClick={() => setPeriod('d30')}
            >
                30D
            </Button>
            <Button
                variant={period === 'd60' ? 'default' : 'outline'}
              size="sm"
                onClick={() => setPeriod('d60')}
            >
                60D
            </Button>
            <Button
                variant={period === 'd90' ? 'default' : 'outline'}
              size="sm"
                onClick={() => setPeriod('d90')}
            >
                90D
            </Button>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            <div className="md:order-1 order-2">
              <Card className="bg-gradient-to-br from-gray-700/20 to-gray-800/20 border-gray-400/30 h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Medal className="h-12 w-12 text-muted-foreground mb-4" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center mb-4">
                      {leaderboard[1].avatar_url ? (
                        <Image src={leaderboard[1].avatar_url} alt="" width={80} height={80} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">
                      {leaderboard[1].display_name || leaderboard[1].username}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">@{leaderboard[1].username}</p>
                    <div className="text-3xl font-bold text-muted-foreground mb-2">
                      {getCategoryValue(leaderboard[1])}
                    </div>
                    <Link href={`/profile/${leaderboard[1].username}`}>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="md:order-2 order-1">
              <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-500/50 h-full md:scale-105 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Crown className="h-8 w-8 text-yellow-400" />
                </div>
                <CardContent className="p-6 pt-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-yellow-400 font-bold text-sm mb-2">🏆 CHAMPION</div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-4 ring-4 ring-yellow-400/30">
                      {leaderboard[0].avatar_url ? (
                        <Image src={leaderboard[0].avatar_url} alt="" width={96} height={96} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="h-12 w-12 text-white" />
                      )}
                    </div>
                    <h3 className="font-bold text-xl mb-1">
                      {leaderboard[0].display_name || leaderboard[0].username}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">@{leaderboard[0].username}</p>
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      {getCategoryValue(leaderboard[0])}
                    </div>
                    <Link href={`/profile/${leaderboard[0].username}`}>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="md:order-3 order-3">
              <Card className="bg-gradient-to-br from-amber-700/20 to-amber-900/20 border-amber-600/30 h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Medal className="h-12 w-12 text-amber-600 mb-4" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mb-4">
                      {leaderboard[2].avatar_url ? (
                        <Image src={leaderboard[2].avatar_url} alt="" width={80} height={80} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">
                      {leaderboard[2].display_name || leaderboard[2].username}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">@{leaderboard[2].username}</p>
                    <div className="text-3xl font-bold text-amber-400 mb-2">
                      {getCategoryValue(leaderboard[2])}
                    </div>
                    <Link href={`/profile/${leaderboard[2].username}`}>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Rankings Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>
              Showing top {leaderboard.length} traders by {getCategoryLabel().toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.slice(3).map((entry) => (
                <Link key={entry.user_id} href={`/profile/${entry.username}`}>
                  <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-all cursor-pointer hover:scale-[1.02] hover:border hover:border-cyan-500/20">
                    {/* Rank */}
                    <div className="w-12 text-center flex-shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      {entry.avatar_url ? (
                        <Image src={entry.avatar_url} alt="" width={48} height={48} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="h-6 w-6 text-white" />
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {entry.display_name || entry.username}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">@{entry.username}</div>
                    </div>

                    {/* Badge */}
                    <div className="hidden md:block">
                      {getRankBadge(entry.rank)}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <div className="font-bold text-white">{getCategoryValue(entry)}</div>
                        <div className="text-xs text-muted-foreground">{getCategoryLabel()}</div>
                      </div>
                      <div className="text-right hidden lg:block">
                        <div className="font-semibold text-white">{entry.total_positions}</div>
                        <div className="text-xs text-muted-foreground">Positions</div>
                      </div>
                      <div className="text-right hidden lg:block">
                        <div className="font-semibold text-white">{entry.follower_count}</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        {!currentUser && (
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20 mt-8">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Join the Competition</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start tracking your trades and compete with other traders. Sign up now and climb the leaderboard!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
                <a href="https://discord.gg/TzjfyPMw" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="secondary">
                    Join Discord (Free)
                  </Button>
                </a>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Want feedback and trade breakdowns? Discord is where the daily discussion happens.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
