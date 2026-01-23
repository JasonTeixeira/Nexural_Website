'use client'

import { useCallback, useEffect, useState } from 'react'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { User, Camera, Save, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  user_id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  twitter_handle: string | null
  linkedin_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  instagram_url: string | null
  discord_url: string | null
  telegram_url: string | null
  medium_url: string | null
  github_url: string | null
  tradingview_url: string | null
  is_profile_public: boolean
  show_performance: boolean
  portfolio_visibility_mode?: 'public' | 'private'
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isNewProfile, setIsNewProfile] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    website_url: '',
    twitter_handle: '',
    linkedin_url: '',
    youtube_url: '',
    tiktok_url: '',
    instagram_url: '',
    discord_url: '',
    telegram_url: '',
    medium_url: '',
    github_url: '',
    tradingview_url: '',
    is_profile_public: true,
    show_performance: true,
    portfolio_visibility_mode: 'public' as 'public' | 'private'
  })

  const loadProfile = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFormData({
          username: profileData.username || '',
          display_name: profileData.display_name || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || '',
          website_url: profileData.website_url || '',
          twitter_handle: profileData.twitter_handle || '',
          linkedin_url: profileData.linkedin_url || '',
          youtube_url: profileData.youtube_url || '',
          tiktok_url: profileData.tiktok_url || '',
          instagram_url: profileData.instagram_url || '',
          discord_url: profileData.discord_url || '',
          telegram_url: profileData.telegram_url || '',
          medium_url: profileData.medium_url || '',
          github_url: profileData.github_url || '',
          tradingview_url: profileData.tradingview_url || '',
          is_profile_public: profileData.is_profile_public ?? true,
          show_performance: profileData.show_performance ?? true,
          portfolio_visibility_mode: profileData.portfolio_visibility_mode ?? 'public'
        })
      } else {
        // No profile exists, need to create one
        setIsNewProfile(true)
        // Generate default username from email
        const emailUsername = user.email?.split('@')[0] || 'user'
        setFormData(prev => ({ ...prev, username: emailUsername }))
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading profile:', error)
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user) return

    setSaving(true)

    try {
      const supabase = createClient()

      const profileData = {
        user_id: user.id,
        username: formData.username.toLowerCase().trim(),
        display_name: formData.display_name.trim() || null,
        bio: formData.bio.trim() || null,
        avatar_url: formData.avatar_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        twitter_handle: formData.twitter_handle.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
        youtube_url: formData.youtube_url.trim() || null,
        tiktok_url: formData.tiktok_url.trim() || null,
        instagram_url: formData.instagram_url.trim() || null,
        discord_url: formData.discord_url.trim() || null,
        telegram_url: formData.telegram_url.trim() || null,
        medium_url: formData.medium_url.trim() || null,
        github_url: formData.github_url.trim() || null,
        tradingview_url: formData.tradingview_url.trim() || null,
        is_profile_public: formData.is_profile_public,
        show_performance: formData.show_performance,
        portfolio_visibility_mode: formData.portfolio_visibility_mode
      }

      if (isNewProfile) {
        // Insert new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single()

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            alert('Username already taken. Please choose a different username.')
            setSaving(false)
            return
          }
          throw error
        }

        setProfile(data)
        setIsNewProfile(false)
        alert('Profile created successfully!')
      } else {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            alert('Username already taken. Please choose a different username.')
            setSaving(false)
            return
          }
          throw error
        }

        setProfile(data)
        alert('Profile updated successfully!')
      }

      setSaving(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MemberPortalLayoutNew>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  return (
    <MemberPortalLayoutNew>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-400 mt-1">
            {isNewProfile ? 'Set up your public profile' : 'Manage your public profile'}
          </p>
        </div>

        {isNewProfile && (
          <Card className="bg-cyan-500/10 border-cyan-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <User className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-1">Welcome! Create your profile</h3>
                  <p className="text-sm text-gray-300">
                    Set up your profile so other members can find and follow you. Your username will be used in your profile URL.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Information */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>This information will be visible on your public profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="your_username"
                  required
                  pattern="[a-z0-9_]{3,30}"
                  title="3-30 characters, lowercase letters, numbers, and underscores only"
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Your profile URL: nexural.com/profile/{formData.username || 'your_username'}
                </p>
              </div>

              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  placeholder="John Doe"
                  maxLength={50}
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400 mt-1">Optional: Your full name or display name</p>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell others about yourself and your trading style..."
                  rows={4}
                  maxLength={500}
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500 characters</p>
              </div>

              <div>
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400 mt-1">Optional: Link to your profile picture</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Links - Enhanced */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media and platforms (all optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="website_url">🌐 Website</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://yourwebsite.com"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter_handle">𝕏 Twitter/X Handle</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-700 bg-gray-800 text-gray-400">
                      @
                    </span>
                    <Input
                      id="twitter_handle"
                      value={formData.twitter_handle}
                      onChange={(e) => setFormData({...formData, twitter_handle: e.target.value})}
                      placeholder="username"
                      className="bg-gray-800 border-gray-700 rounded-l-none"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkedin_url">💼 LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube_url">📺 YouTube</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                    placeholder="https://youtube.com/@yourchannel"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram_url">📸 Instagram</Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                    placeholder="https://instagram.com/username"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="tiktok_url">🎵 TikTok</Label>
                  <Input
                    id="tiktok_url"
                    type="url"
                    value={formData.tiktok_url}
                    onChange={(e) => setFormData({...formData, tiktok_url: e.target.value})}
                    placeholder="https://tiktok.com/@username"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="discord_url">💬 Discord</Label>
                  <Input
                    id="discord_url"
                    type="url"
                    value={formData.discord_url}
                    onChange={(e) => setFormData({...formData, discord_url: e.target.value})}
                    placeholder="https://discord.gg/TzjfyPMw"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="telegram_url">✈️ Telegram</Label>
                  <Input
                    id="telegram_url"
                    type="url"
                    value={formData.telegram_url}
                    onChange={(e) => setFormData({...formData, telegram_url: e.target.value})}
                    placeholder="https://t.me/username"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="medium_url">📝 Medium/Blog</Label>
                  <Input
                    id="medium_url"
                    type="url"
                    value={formData.medium_url}
                    onChange={(e) => setFormData({...formData, medium_url: e.target.value})}
                    placeholder="https://medium.com/@username"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="github_url">💻 GitHub</Label>
                  <Input
                    id="github_url"
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                    placeholder="https://github.com/username"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="tradingview_url">📊 TradingView</Label>
                  <Input
                    id="tradingview_url"
                    type="url"
                    value={formData.tradingview_url}
                    onChange={(e) => setFormData({...formData, tradingview_url: e.target.value})}
                    placeholder="https://tradingview.com/u/username"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                💡 Tip: Add links to platforms where you share trading content or connect with other traders
              </p>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control what others can see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Portfolio Visibility Mode (Global)</Label>
                <p className="text-sm text-gray-400">
                  SSOT: choose one global mode. In <strong>Private</strong>, your portfolios/positions are hidden from other members and you are removed from leaderboards/discovery.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={formData.portfolio_visibility_mode === 'public' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, portfolio_visibility_mode: 'public' })}
                  >
                    Public
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={formData.portfolio_visibility_mode === 'private' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, portfolio_visibility_mode: 'private' })}
                  >
                    Private
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-gray-400">
                    Allow others to view your profile and portfolios
                  </p>
                </div>
                <Switch
                  checked={formData.is_profile_public}
                  onCheckedChange={(checked) => setFormData({...formData, is_profile_public: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Performance Stats</Label>
                  <p className="text-sm text-gray-400">
                    Display your win rate and returns on your profile
                  </p>
                </div>
                <Switch
                  checked={formData.show_performance}
                  onCheckedChange={(checked) => setFormData({...formData, show_performance: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              {!isNewProfile && profile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(`/profile/${profile.username}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Profile
                </Button>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : isNewProfile ? 'Create Profile' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </MemberPortalLayoutNew>
  )
}
