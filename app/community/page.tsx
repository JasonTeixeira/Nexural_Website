'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Search,
  TrendingUp,
  Users,
  ArrowLeft,
  ExternalLink,
  UserPlus,
  UserCheck,
  TrendingDown,
  Target,
  Signal,
  Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CommunityActivityFeed } from '@/components/community-activity-feed'
import { FollowingFeed } from '@/components/community/following-feed'

interface CommunityMember {
  id: string
  user_id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_profile_public: boolean
  follower_count: number
  total_positions: number
  win_rate: number | null
  total_return_pct: number | null
  created_at: string
}

export default function CommunityPage() {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [followLoading, setFollowLoading] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    loadCommunityMembers()
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (user) {
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
        setFollowingCount(followsData?.length || 0)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  useEffect(() => {
    if (members.length > 0) {
      loadFollowStatus()
    }
  }, [members])

  useEffect(() => {
    // Filter members based on search query
    if (searchQuery.trim() === '') {
      setFilteredMembers(members)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = members.filter(member => 
        member.username.toLowerCase().includes(query) ||
        (member.display_name && member.display_name.toLowerCase().includes(query)) ||
        (member.bio && member.bio.toLowerCase().includes(query))
      )
      setFilteredMembers(filtered)
    }
  }, [searchQuery, members])

  async function loadCommunityMembers() {
    try {
      const supabase = createClient()
      
      // Load all public profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_profile_public', true)
        .order('follower_count', { ascending: false })

      if (error) throw error

      setMembers(data || [])
      setFilteredMembers(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading community members:', error)
      setLoading(false)
    }
  }

  async function loadFollowStatus() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (user && members.length > 0) {
        const userIds = members.map(m => m.user_id).join(',')
        const response = await fetch(`/api/community/follow?userIds=${userIds}`)
        const data = await response.json()
        setFollowingIds(data.following || [])
      }
    } catch (error) {
      console.error('Error loading follow status:', error)
    }
  }

  async function handleFollow(userId: string, isFollowing: boolean) {
    if (!currentUser) {
      window.location.href = '/auth/login'
      return
    }

    setFollowLoading([...followLoading, userId])

    try {
      const response = await fetch('/api/community/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followingUserId: userId,
          action: isFollowing ? 'unfollow' : 'follow'
        })
      })

      if (response.ok) {
        if (isFollowing) {
          setFollowingIds(followingIds.filter(id => id !== userId))
          // Update member's follower count locally
          setMembers(members.map(m => 
            m.user_id === userId 
              ? { ...m, follower_count: Math.max(m.follower_count - 1, 0) }
              : m
          ))
          setFilteredMembers(filteredMembers.map(m => 
            m.user_id === userId 
              ? { ...m, follower_count: Math.max(m.follower_count - 1, 0) }
              : m
          ))
        } else {
          setFollowingIds([...followingIds, userId])
          setMembers(members.map(m => 
            m.user_id === userId 
              ? { ...m, follower_count: m.follower_count + 1 }
              : m
          ))
          setFilteredMembers(filteredMembers.map(m => 
            m.user_id === userId 
              ? { ...m, follower_count: m.follower_count + 1 }
              : m
          ))
        }
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setFollowLoading(followLoading.filter(id => id !== userId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Community
                </span>
              </h1>
              <p className="text-xl text-gray-400">
                Discover and follow traders in our community
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{members.length}</div>
                <div className="text-sm text-gray-400">Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">
                  {members.reduce((sum, m) => sum + m.total_positions, 0)}
                </div>
                <div className="text-sm text-gray-400">Total Positions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs defaultValue={currentUser && followingCount > 0 ? "following" : "discover"} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="discover" className="gap-2">
              <Users className="h-4 w-4" />
              Discover
            </TabsTrigger>
            {currentUser && (
              <TabsTrigger value="following" className="gap-2">
                <Activity className="h-4 w-4" />
                Following {followingCount > 0 && `(${followingCount})`}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover">
            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search members by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} found
              </p>
            </div>

            {/* Main Content with Sidebar */}
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Members Grid */}
              <div className="lg:col-span-3">
            {filteredMembers.length === 0 ? (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No members found</h3>
                    <p className="text-gray-400">
                      {searchQuery ? 'Try a different search term' : 'Be the first to create a public profile!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-cyan-500/50 transition-all group">
                <CardContent className="p-6">
                  <Link href={`/profile/${member.username}`}>
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.username} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate group-hover:text-cyan-400 transition-colors">
                          {member.display_name || member.username}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">@{member.username}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                        {member.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{member.follower_count}</div>
                        <div className="text-xs text-gray-400">Followers</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{member.total_positions}</div>
                        <div className="text-xs text-gray-400">Positions</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {member.win_rate ? `${member.win_rate.toFixed(0)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                    </div>

                    {/* Performance Badge */}
                    {member.total_return_pct !== null && (
                      <Badge 
                        variant={member.total_return_pct >= 0 ? 'default' : 'destructive'}
                        className="w-full justify-center"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {member.total_return_pct >= 0 ? '+' : ''}{member.total_return_pct.toFixed(2)}% Return
                      </Badge>
                    )}
                  </Link>

                  {/* Follow Button (if logged in and not own profile) */}
                  {currentUser && currentUser.id !== member.user_id && (
                    <Button
                      variant={followingIds.includes(member.user_id) ? "outline" : "default"}
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.preventDefault()
                        handleFollow(member.user_id, followingIds.includes(member.user_id))
                      }}
                      disabled={followLoading.includes(member.user_id)}
                    >
                      {followLoading.includes(member.user_id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Loading...
                        </>
                      ) : followingIds.includes(member.user_id) ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}

                  {/* View Profile Button */}
                  <Link href={`/profile/${member.username}`}>
                    <Button 
                      variant="outline"
                      className={`w-full ${currentUser && currentUser.id !== member.user_id ? 'mt-2' : 'mt-4'}`}
                    >
                      View Profile
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CommunityActivityFeed filter="all" limit={15} showFilters={true} compact={true} />
            </div>
          </div>
        </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20 mt-12">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Join the Community</h2>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Create your profile, track your trades, and connect with other traders. It's 100% FREE!
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          {currentUser && (
            <TabsContent value="following">
              <div className="max-w-4xl mx-auto">
                <FollowingFeed currentUser={currentUser} followingCount={followingCount} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
