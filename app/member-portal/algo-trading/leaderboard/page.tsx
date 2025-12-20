'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/algo-trading/waitlist/leaderboard?limit=100')
      const data = await response.json()
      
      if (data.success) {
        setLeaderboard(data.leaderboard)
        
        // TODO: Get actual member ID and find their rank
        // const memberId = 'temp-member-id'
        // const myEntry = data.leaderboard.find((entry: any) => entry.member_id === memberId)
        // if (myEntry) setMyRank(myEntry.rank)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-800 border-gray-200'
    if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200'
    return ''
  }

  const getLevelColor = (level: number) => {
    const colors = ['#9CA3AF', '#60A5FA', '#A78BFA', '#F59E0B', '#EF4444']
    return colors[level - 1] || colors[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Top members ranked by engagement score
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="text-3xl font-bold">{leaderboard.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Your Rank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold">
                {myRank ? `#${myRank}` : 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Top Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="text-3xl font-bold">
                {leaderboard[0]?.engagement_score || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 2nd Place */}
          <Card className="md:order-1 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Medal className="h-12 w-12 text-gray-400" />
              </div>
              <CardTitle className="text-lg">2nd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold mb-2">
                {leaderboard[1]?.algo_trading_waitlist?.name || 'Anonymous'}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Score:</span>
                  <span className="font-semibold">{leaderboard[1]?.engagement_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Level:</span>
                  <Badge variant="secondary">{leaderboard[1]?.algo_trading_waitlist?.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Referrals:</span>
                  <span className="font-semibold">{leaderboard[1]?.referrals_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="md:order-2 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 md:-mt-4">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">1st Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold mb-2">
                {leaderboard[0]?.algo_trading_waitlist?.name || 'Anonymous'}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Score:</span>
                  <span className="font-semibold">{leaderboard[0]?.engagement_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Level:</span>
                  <Badge variant="secondary">{leaderboard[0]?.algo_trading_waitlist?.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Referrals:</span>
                  <span className="font-semibold">{leaderboard[0]?.referrals_count}</span>
                </div>
              </div>
              {leaderboard[0]?.algo_trading_waitlist?.badges?.length > 0 && (
                <div className="mt-3 flex justify-center gap-1">
                  {leaderboard[0].algo_trading_waitlist.badges.slice(0, 3).map((badge: string, i: number) => (
                    <span key={i} className="text-xl">
                      {badge === 'super_referrer' && '🌟'}
                      {badge === 'top_referrer' && '⭐'}
                      {badge === 'early_bird' && '🐦'}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="md:order-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Medal className="h-12 w-12 text-amber-600" />
              </div>
              <CardTitle className="text-lg">3rd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold mb-2">
                {leaderboard[2]?.algo_trading_waitlist?.name || 'Anonymous'}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Score:</span>
                  <span className="font-semibold">{leaderboard[2]?.engagement_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Level:</span>
                  <Badge variant="secondary">{leaderboard[2]?.algo_trading_waitlist?.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Referrals:</span>
                  <span className="font-semibold">{leaderboard[2]?.referrals_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>
            Top 100 members by engagement score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor(entry.rank)} ${
                  entry.rank === myRank ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold">
                      {entry.algo_trading_waitlist?.name || 'Anonymous'}
                      {entry.rank === myRank && (
                        <Badge variant="secondary" className="ml-2">You</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.algo_trading_waitlist?.referral_code}
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Level</div>
                      <div 
                        className="font-bold"
                        style={{ color: getLevelColor(entry.algo_trading_waitlist?.level || 1) }}
                      >
                        {entry.algo_trading_waitlist?.level || 1}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500">Points</div>
                      <div className="font-bold">{entry.total_points}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500">Referrals</div>
                      <div className="font-bold">{entry.referrals_count}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500">Score</div>
                      <div className="font-bold text-blue-600">{entry.engagement_score}</div>
                    </div>
                  </div>

                  {entry.algo_trading_waitlist?.badges?.length > 0 && (
                    <div className="flex gap-1">
                      {entry.algo_trading_waitlist.badges.slice(0, 3).map((badge: string, i: number) => (
                        <span key={i} className="text-lg">
                          {badge === 'super_referrer' && '🌟'}
                          {badge === 'top_referrer' && '⭐'}
                          {badge === 'active_referrer' && '✨'}
                          {badge === 'early_bird' && '🐦'}
                          {badge === 'engaged' && '📧'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No members on the leaderboard yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How Scoring Works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Scoring Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Points</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Signup: 100 points</li>
                <li>• Referral: 50 points</li>
                <li>• Email open: 5 points</li>
                <li>• Link click: 10 points</li>
                <li>• Social share: 10-15 points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Engagement Score</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Total points</li>
                <li>• Referrals × 10</li>
                <li>• Email opens × 2</li>
                <li>• Link clicks × 5</li>
                <li>• Badges × 50</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
