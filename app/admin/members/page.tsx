'use client'

import { useState, useEffect } from 'react'

interface Member {
  id: string
  email: string
  discordId?: string
  discordUsername?: string
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial'
  subscriptionTier: 'basic' | 'premium' | 'pro'
  joinDate: string
  lastActive: string
  totalPaid: number
  nextBilling?: string
}

interface Subscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed'
  source: string
  subscribedAt: string
}

interface ChannelConfig {
  symbol: string
  name: string
  enabled: boolean
  scheduled: boolean
  tradingHours: string
  color: string
}

export default function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [channels, setChannels] = useState<ChannelConfig[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('members')
  const [isLoading, setIsLoading] = useState(true)
  const [totalMembers, setTotalMembers] = useState(0)
  const [totalSubscribers, setTotalSubscribers] = useState(0)

  // Load REAL data from API
  useEffect(() => {
    loadMembers()
    loadSubscribers()
    loadChannels()
  }, [])

  // Reload when search term changes
  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers()
    } else if (activeTab === 'newsletter') {
      loadSubscribers()
    }
  }, [searchTerm, activeTab])

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        action: 'list',
        limit: '100',
        offset: '0'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/admin/members?${params}`)
      if (response.ok) {
        const data = await response.json()
        const formattedMembers: Member[] = data.members.map((m: any) => ({
          id: m.id,
          email: m.email,
          discordId: m.discord_id,
          discordUsername: m.discord_username,
          subscriptionStatus: m.subscription_status,
          subscriptionTier: m.subscription_tier,
          joinDate: m.created_at,
          lastActive: m.last_login || m.updated_at,
          totalPaid: m.total_spent || 0,
          nextBilling: m.next_billing_date
        }))
        setMembers(formattedMembers)
        setTotalMembers(data.total || formattedMembers.length)
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubscribers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        limit: '100',
        offset: '0'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/newsletter/subscribers?${params}`)
      if (response.ok) {
        const data = await response.json()
        const formattedSubscribers: Subscriber[] = data.subscribers.map((s: any) => ({
          id: s.id,
          email: s.email,
          status: s.status,
          source: s.source || 'website',
          subscribedAt: s.created_at
        }))
        setSubscribers(formattedSubscribers)
        setTotalSubscribers(data.total || formattedSubscribers.length)
      }
    } catch (error) {
      console.error('Error loading subscribers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChannels = async () => {
    // Keep mock channels for now - these are configuration, not data
    const mockChannels: ChannelConfig[] = [
      { symbol: 'ES', name: 'E-mini S&P 500', enabled: true, scheduled: true, tradingHours: '9:30-16:00 EST', color: 'border-blue-500' },
      { symbol: 'NQ', name: 'E-mini NASDAQ', enabled: true, scheduled: true, tradingHours: '9:30-16:00 EST', color: 'border-green-500' },
      { symbol: 'YM', name: 'E-mini Dow', enabled: true, scheduled: false, tradingHours: '9:30-16:00 EST', color: 'border-yellow-500' },
      { symbol: 'RTY', name: 'E-mini Russell', enabled: true, scheduled: true, tradingHours: '9:30-16:00 EST', color: 'border-purple-500' },
      { symbol: 'BTC', name: 'Bitcoin', enabled: false, scheduled: false, tradingHours: '24/7', color: 'border-orange-500' },
      { symbol: 'ETH', name: 'Ethereum', enabled: true, scheduled: false, tradingHours: '24/7', color: 'border-cyan-500' },
      { symbol: 'CL', name: 'Crude Oil', enabled: true, scheduled: true, tradingHours: '9:00-14:30 EST', color: 'border-red-500' },
      { symbol: 'GC', name: 'Gold', enabled: true, scheduled: true, tradingHours: '8:20-13:30 EST', color: 'border-yellow-400' },
      { symbol: 'SI', name: 'Silver', enabled: false, scheduled: false, tradingHours: '8:25-13:25 EST', color: 'border-gray-400' }
    ]
    setChannels(mockChannels)
  }

  const toggleChannel = (symbol: string) => {
    setChannels(prev => prev.map(channel => 
      channel.symbol === symbol 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ))
  }

  const toggleScheduling = (symbol: string) => {
    setChannels(prev => prev.map(channel => 
      channel.symbol === symbol 
        ? { ...channel, scheduled: !channel.scheduled }
        : channel
    ))
  }

  const cancelMembership = async (memberId: string) => {
    if (!confirm('Are you sure you want to cancel this membership?')) return

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel-subscription',
          memberId,
          reason: 'Admin cancellation'
        })
      })

      if (response.ok) {
        alert('Membership cancelled successfully')
        loadMembers() // Reload data
      } else {
        alert('Failed to cancel membership')
      }
    } catch (error) {
      alert('Failed to cancel membership')
    }
  }

  const reactivateMembership = async (memberId: string) => {
    if (!confirm('Are you sure you want to reactivate this membership?')) return

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-subscription',
          memberId,
          subscriptionData: {
            status: 'active',
            tier: 'basic'
          }
        })
      })

      if (response.ok) {
        alert('Membership reactivated successfully')
        loadMembers() // Reload data
      } else {
        alert('Failed to reactivate membership')
      }
    } catch (error) {
      alert('Failed to reactivate membership')
    }
  }

  const filteredMembers = members.filter(member => 
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.discordUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-green-100'
      case 'cancelled': return 'bg-red-600 text-red-100'
      case 'expired': return 'bg-gray-600 text-gray-100'
      case 'trial': return 'bg-blue-600 text-blue-100'
      case 'unsubscribed': return 'bg-red-600 text-red-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-600 text-blue-100'
      case 'premium': return 'bg-purple-600 text-purple-100'
      case 'pro': return 'bg-yellow-600 text-yellow-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">👥 Members Management</h1>
          <p className="text-gray-300">Manage subscriptions, channels, and member access</p>
        </div>

        <div className="mb-6">
          <input
            placeholder="Search by email or Discord username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'members', label: 'Premium Members', icon: '👥' },
              { id: 'newsletter', label: 'Newsletter', icon: '📧' },
              { id: 'channels', label: 'Channel Control', icon: '🎛️' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'members' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              Premium Members ({isLoading ? '...' : totalMembers})
            </h2>
            <p className="text-gray-400 mb-6">Manage premium subscriptions and Discord access</p>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-400">Loading members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-gray-400">No members found</p>
                {searchTerm && <p className="text-sm text-gray-500 mt-2">Try adjusting your search</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{member.email}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(member.subscriptionStatus)}`}>
                            {member.subscriptionStatus}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTierColor(member.subscriptionTier)}`}>
                            {member.subscriptionTier}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="font-medium text-gray-200">Discord:</span><br />
                            {member.discordUsername || 'Not connected'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-200">Joined:</span><br />
                            {new Date(member.joinDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-200">Total Paid:</span><br />
                            ${member.totalPaid}
                          </div>
                          <div>
                            <span className="font-medium text-gray-200">Next Billing:</span><br />
                            {member.nextBilling ? new Date(member.nextBilling).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {member.subscriptionStatus === 'active' ? (
                          <button 
                            onClick={() => cancelMembership(member.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button 
                            onClick={() => reactivateMembership(member.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                          >
                            Reactivate
                          </button>
                        )}
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">
              Newsletter Subscribers ({isLoading ? '...' : totalSubscribers})
            </h2>
            <p className="text-gray-400 mb-6">Manage newsletter subscriptions and email list</p>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-400">Loading subscribers...</p>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📧</div>
                <p className="text-gray-400">No subscribers found</p>
                {searchTerm && <p className="text-sm text-gray-500 mt-2">Try adjusting your search</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubscribers.map((subscriber) => (
                  <div key={subscriber.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{subscriber.email}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscriber.status)}`}>
                            {subscriber.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="font-medium text-gray-200">Source:</span><br />
                            {subscriber.source}
                          </div>
                          <div>
                            <span className="font-medium text-gray-200">Subscribed:</span><br />
                            {new Date(subscriber.subscribedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {subscriber.status === 'active' ? (
                          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                            Unsubscribe
                          </button>
                        ) : (
                          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                            Resubscribe
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">🎛️ Channel Control & Scheduling</h2>
            <p className="text-gray-400 mb-6">Enable/disable channels and manage trading hours</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <div key={channel.symbol} className={`bg-gray-700 rounded-lg p-4 border-l-4 ${channel.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-lg text-white">{channel.symbol}</div>
                      <div className="text-sm text-gray-300">{channel.name}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleChannel(channel.symbol)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                          channel.enabled 
                            ? 'bg-green-600 text-green-100 hover:bg-green-700' 
                            : 'bg-red-600 text-red-100 hover:bg-red-700'
                        }`}
                      >
                        {channel.enabled ? '✅ ON' : '❌ OFF'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-3">
                    <div><strong>Trading Hours:</strong> {channel.tradingHours}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Auto Schedule:</span>
                    <button
                      onClick={() => toggleScheduling(channel.symbol)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                        channel.scheduled 
                          ? 'bg-blue-600 text-blue-100 hover:bg-blue-700' 
                          : 'bg-gray-600 text-gray-100 hover:bg-gray-700'
                      }`}
                    >
                      {channel.scheduled ? '🕐 SCHEDULED' : '⏸️ MANUAL'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Premium Members</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Active:</span>
                  <span className="font-medium text-green-400">{members.filter(m => m.subscriptionStatus === 'active').length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Cancelled:</span>
                  <span className="font-medium text-red-400">{members.filter(m => m.subscriptionStatus === 'cancelled').length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Revenue:</span>
                  <span className="font-medium text-yellow-400">${members.reduce((sum, m) => sum + m.totalPaid, 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Newsletter</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Active:</span>
                  <span className="font-medium text-green-400">{subscribers.filter(s => s.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Unsubscribed:</span>
                  <span className="font-medium text-red-400">{subscribers.filter(s => s.status === 'unsubscribed').length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Growth Rate:</span>
                  <span className="font-medium text-blue-400">+12%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Channels</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Active:</span>
                  <span className="font-medium text-green-400">{channels.filter(c => c.enabled).length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Scheduled:</span>
                  <span className="font-medium text-blue-400">{channels.filter(c => c.scheduled).length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Signals:</span>
                  <span className="font-medium text-yellow-400">1,247</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Admin */}
        <div className="mt-8">
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
