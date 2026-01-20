'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  MapPin, 
  Calendar, 
  Globe, 
  Twitter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  UserPlus,
  UserMinus,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ReportBlockMenu } from '@/components/social/report-block-menu'
import { useBlocking } from '@/hooks/use-blocking'

interface UserProfile {
  id: string
  user_id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  twitter_handle: string | null
  is_profile_public: boolean
  show_performance: boolean
  portfolio_visibility_mode?: 'public' | 'private'
  follower_count: number
  following_count: number
  total_positions: number
  total_return: number | null
  total_return_pct: number | null
  win_rate: number | null
  created_at: string
}

interface Portfolio {
  id: string
  name: string
  description: string | null
  visibility: string
  total_value: number
  total_return: number
  total_return_pct: number
  win_rate: number
}

interface Position {
  id: string
  symbol: string
  type: string
  direction: string
  entry_price: number
  current_price: number
  quantity: number
  entry_date: string
  status: string
  pnl: number | null
  pnl_percentage: number | null
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params?.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const blocking = useBlocking()

  const loadProfileData = useCallback(async () => {
    try {
      const supabase = createClient()

      // Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Load profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError || !profileData) {
        setLoading(false)
        return
      }

      // Check if profile is public
      if (!profileData.is_profile_public && (!user || user.id !== profileData.user_id)) {
        // Profile is private and viewer is not the owner
        setLoading(false)
        return
      }

      // SSOT: global portfolio visibility mode overrides per-portfolio visibility.
      if (profileData.portfolio_visibility_mode === 'private' && (!user || user.id !== profileData.user_id)) {
        setLoading(false)
        return
      }

      // If viewer has blocked this user (or vice versa), hide profile.
      // NOTE: reverse-block (they blocked viewer) depends on RLS; this is best-effort.
      if (user && blocking.isBlocked(profileData.user_id)) {
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Load portfolios
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', profileData.user_id)
        .in('visibility', ['public'])
        .order('is_default', { ascending: false })

      setPortfolios(portfolioData || [])

      // Load positions from public portfolios
      if (portfolioData && portfolioData.length > 0) {
        const portfolioIds = portfolioData.map(p => p.id)
        const { data: positionData } = await supabase
          .from('positions')
          .select('*')
          .in('portfolio_id', portfolioIds)
          .order('entry_date', { ascending: false })
          .limit(20)

        setPositions(positionData || [])
      }

      // Check if current user is following this profile
      if (user && user.id !== profileData.user_id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.user_id)
          .single()

        setIsFollowing(!!followData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading profile:', error)
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    void loadProfileData()
  }, [loadProfileData])

  async function handleFollowToggle() {
    if (!currentUser || !profile) return

    try {
      if (isFollowing) {
        // Unfollow
        await fetch('/api/community/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingUserId: profile.user_id, action: 'unfollow' }),
        })
        setIsFollowing(false)
        setProfile({...profile, follower_count: profile.follower_count - 1})
      } else {
        // Follow
        await fetch('/api/community/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingUserId: profile.user_id, action: 'follow' }),
        })
        setIsFollowing(true)
        setProfile({...profile, follower_count: profile.follower_count + 1})
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">This profile doesn't exist or is private</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser && currentUser.id === profile.user_id

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.username} width={96} height={96} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Link href="/member-portal/profile">
                      <Button variant="outline">
                        Edit Profile
                      </Button>
                    </Link>
                  ) : currentUser ? (
                    <>
                      <Button
                        onClick={handleFollowToggle}
                        className={isFollowing ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                      <ReportBlockMenu actorUserId={profile.user_id} targetType="user" targetId={profile.user_id} />
                    </>
                  ) : (
                    <Link href="/auth/login">
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                        Login to Follow
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-foreground/80 mb-4">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <span className="font-bold text-white">{profile.follower_count}</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-white">{profile.following_count}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold text-white">{profile.total_positions}</span>
                  <span className="text-muted-foreground ml-1">Positions</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Social Links */}
              {(profile.website_url || profile.twitter_handle) && (
                <div className="flex items-center gap-4 mt-4">
                  {profile.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                  {profile.twitter_handle && (
                    <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      <Twitter className="h-4 w-4" />
                      <span className="text-sm">@{profile.twitter_handle}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Stats */}
        {profile.show_performance && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Return</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${profile.total_return && profile.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profile.total_return ? `$${profile.total_return.toFixed(2)}` : 'N/A'}
                </div>
                {profile.total_return_pct && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.total_return_pct.toFixed(2)}% return
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                <Target className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {profile.win_rate ? `${profile.win_rate.toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Success rate</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {positions.filter(p => p.status === 'open').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Currently trading</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            {positions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No public positions yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              positions.map((position) => (
                <Card key={position.id} className="bg-card border-border hover:border-cyan-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          position.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {position.direction === 'long' ? (
                            <TrendingUp className="h-6 w-6 text-green-400" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{position.symbol}</h3>
                            <Badge variant={position.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                              {position.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {position.quantity} shares @ ${position.entry_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Entry Date</p>
                        <p className="font-semibold">
                          {new Date(position.entry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="portfolios" className="space-y-4">
            {portfolios.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No public portfolios yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              portfolios.map((portfolio) => (
                <Link key={portfolio.id} href={`/portfolio/${portfolio.id}`}>
                  <Card className="bg-card border-border hover:border-cyan-500/50 transition-all cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        {portfolio.name}
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                      {portfolio.description && (
                        <CardDescription>{portfolio.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Value</p>
                          <p className="text-lg font-bold text-white">
                            ${portfolio.total_value.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Return</p>
                          <p className={`text-lg font-bold ${portfolio.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {portfolio.total_return >= 0 ? '+' : ''}${portfolio.total_return.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Win Rate</p>
                          <p className="text-lg font-bold text-white">
                            {portfolio.win_rate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Click to explore portfolio</p>
                        <Badge variant="outline" className="group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                          View Details
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
