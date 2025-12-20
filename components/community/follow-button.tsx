'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  targetUserId: string
  targetUsername: string
  initialFollowing?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showCount?: boolean
}

export function FollowButton({
  targetUserId,
  targetUsername,
  initialFollowing = false,
  size = 'default',
  variant = 'default',
  showCount = false
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState<number | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkFollowStatus()
    if (showCount) {
      loadFollowerCount()
    }
  }, [targetUserId])

  async function checkFollowStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

      if (!error && data) {
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  async function loadFollowerCount() {
    try {
      const { data, error } = await supabase
        .from('portfolio_stats')
        .select('follower_count')
        .eq('user_id', targetUserId)
        .single()

      if (!error && data) {
        setFollowerCount(data.follower_count)
      }
    } catch (error) {
      console.error('Error loading follower count:', error)
    }
  }

  async function handleFollow() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to login
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
        return
      }

      // Can't follow yourself
      if (user.id === targetUserId) {
        alert("You can't follow yourself!")
        return
      }

      setIsLoading(true)

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)

        if (error) throw error

        setIsFollowing(false)
        if (showCount && followerCount !== null) {
          setFollowerCount(followerCount - 1)
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          })

        if (error) throw error

        setIsFollowing(true)
        if (showCount && followerCount !== null) {
          setFollowerCount(followerCount + 1)
        }

        // Create activity feed entry
        await supabase
          .from('activity_feed')
          .insert({
            user_id: user.id,
            activity_type: 'started_following',
            metadata: {
              followed_user: targetUsername
            }
          })
      }

      router.refresh()
    } catch (error) {
      console.error('Error following/unfollowing:', error)
      alert('Failed to update follow status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      size={size}
      variant={isFollowing ? 'outline' : variant}
      className={isFollowing ? 'border-gray-600' : ''}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Unfollow' : 'Follow'}
      {showCount && followerCount !== null && (
        <span className="ml-2 text-xs opacity-70">
          ({followerCount})
        </span>
      )}
    </Button>
  )
}
