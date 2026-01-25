'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { toast } from '@/hooks/use-toast'

interface DiscordConnectionCardProps {
  memberId: string
  discordUserId: string | null
  discordUsername: string | null
  onConnectionChange?: () => void
}

export function DiscordConnectionCard({ 
  memberId, 
  discordUserId, 
  discordUsername,
  onConnectionChange 
}: DiscordConnectionCardProps) {
  const [isConnected, setIsConnected] = useState(!!discordUserId)
  const [username, setUsername] = useState(discordUsername)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsConnected(!!discordUserId)
    setUsername(discordUsername)
  }, [discordUserId, discordUsername])

  const handleConnect = async () => {
    setIsLoading(true)
    
    try {
      // Get Discord OAuth URL from environment or construct it
      const discordClientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID'
      const redirectUri = `${window.location.origin}/api/auth/discord/callback`
      const scope = 'identify email guilds.join'
      
      // Store member ID in session storage for callback
      sessionStorage.setItem('discord_oauth_member_id', memberId)
      
      // Redirect to Discord OAuth
      const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`
      
      window.location.href = oauthUrl
    } catch (error) {
      console.error('Error initiating Discord connection:', error)
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to Discord. Please try again.',
        variant: 'destructive'
      })
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      // Update member record to remove Discord connection
      const { error } = await supabase
        .from('members')
        .update({
          discord_user_id: null,
          discord_username: null,
          discord_connected: false
        })
        .eq('id', memberId)
      
      if (error) throw error
      
      setIsConnected(false)
      setUsername(null)
      
      toast({
        title: 'Disconnected',
        description: 'Discord account has been disconnected.'
      })
      
      if (onConnectionChange) {
        onConnectionChange()
      }
    } catch (error) {
      console.error('Error disconnecting Discord:', error)
      toast({
        title: 'Disconnection Failed',
        description: 'Unable to disconnect Discord. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Discord Connection</CardTitle>
              <CardDescription>
                {isConnected 
                  ? 'Receive real-time trading signals in Discord' 
                  : 'Connect your Discord to receive signals'}
              </CardDescription>
            </div>
          </div>
          {isConnected ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center justify-between p-4 glass-card rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Connected Account
                </p>
                <p className="text-lg font-semibold data-value text-indigo-400">
                  {username || 'Discord User'}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Receiving real-time trading signals</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Access to exclusive Discord community</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Instant notifications for new positions</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="flex-1"
              >
                Disconnect
              </Button>
              <Button
                variant="default"
				onClick={() => window.open('https://discord.gg/p8Dy4sQHaR', '_blank')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Discord
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your Discord account to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Receive instant trading signal notifications</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Join our exclusive trading community</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Get real-time updates on swing positions</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Access to trading discussions and support</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {isLoading ? 'Connecting...' : 'Connect Discord'}
            </Button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              You'll be redirected to Discord to authorize the connection
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
