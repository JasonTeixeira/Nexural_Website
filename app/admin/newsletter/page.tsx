'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail,
  Users,
  Send,
  ArrowLeft,
  Plus,
  Download,
  Search,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface Subscriber {
  id: string
  email: string
  name: string | null
  subscribed_at: string
  status: string
}

export default function NewsletterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sending, setSending] = useState(false)
  const [campaignData, setCampaignData] = useState({
    subject: '',
    content: '',
    previewText: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadSubscribers()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const loadSubscribers = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false })

      if (!error && data) {
        setSubscribers(data)
      }
    } catch (error) {
      console.error('Error loading subscribers:', error)
    }
  }

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!campaignData.subject || !campaignData.content) {
      alert('❌ Please fill in subject and content')
      return
    }

    const activeSubscribers = filteredSubscribers.filter(s => s.status === 'active')
    
    if (activeSubscribers.length === 0) {
      alert('❌ No active subscribers to send to')
      return
    }

    if (!confirm(`Send newsletter to ${activeSubscribers.length} active subscribers?`)) {
      return
    }

    setSending(true)
    
    try {
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: campaignData.subject,
          content: campaignData.content,
          previewText: campaignData.previewText,
          subscribers: activeSubscribers
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`✅ ${data.message}\n\nSent: ${data.results.sent}\nFailed: ${data.results.failed}`)
        
        // Reset form
        setCampaignData({
          subject: '',
          content: '',
          previewText: ''
        })
        
        // Reload subscribers
        await loadSubscribers()
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error: any) {
      alert(`❌ Failed to send newsletter: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleExportSubscribers = () => {
    const csv = [
      ['Email', 'Name', 'Subscribed At', 'Status'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading newsletter...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const activeSubscribers = subscribers.filter(s => s.status === 'active').length

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">📧 Newsletter Management</h1>
                <p className="text-sm text-gray-400">Manage subscribers and send campaigns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Subscribers</p>
                  <p className="text-2xl font-bold text-white">{subscribers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-white">{activeSubscribers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Growth Rate</p>
                  <p className="text-2xl font-bold text-white">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscribers" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="subscribers">
              <Users className="h-4 w-4 mr-2" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="send">
              <Send className="h-4 w-4 mr-2" />
              Send Campaign
            </TabsTrigger>
          </TabsList>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Newsletter Subscribers</CardTitle>
                    <CardDescription>Manage your newsletter subscriber list</CardDescription>
                  </div>
                  <Button
                    onClick={handleExportSubscribers}
                    variant="outline"
                    className="border-gray-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search subscribers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-900 border-gray-700"
                    />
                  </div>
                </div>

                {/* Subscribers List */}
                {filteredSubscribers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Subscribers Found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try a different search term' : 'Subscribers will appear here when they sign up'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{subscriber.email}</p>
                            <p className="text-sm text-gray-400">
                              {subscriber.name || 'No name'} • Subscribed {new Date(subscriber.subscribed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={subscriber.status === 'active' ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-gray-900/50 text-gray-400 border-gray-600'}
                        >
                          {subscriber.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {filteredSubscribers.length > 0 && (
                  <p className="text-sm text-gray-500 text-center mt-6">
                    Showing {filteredSubscribers.length} of {subscribers.length} subscribers
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Campaign Tab */}
          <TabsContent value="send">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Send Newsletter Campaign</CardTitle>
                <CardDescription>
                  Create and send a newsletter to {activeSubscribers} active subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendCampaign} className="space-y-6">
                  <div>
                    <Label htmlFor="subject">Email Subject *</Label>
                    <Input
                      id="subject"
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                      placeholder="Your newsletter subject line..."
                      required
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="previewText">Preview Text</Label>
                    <Input
                      id="previewText"
                      value={campaignData.previewText}
                      onChange={(e) => setCampaignData({ ...campaignData, previewText: e.target.value })}
                      placeholder="This appears in email previews..."
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Email Content *</Label>
                    <Textarea
                      id="content"
                      value={campaignData.content}
                      onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                      placeholder="Write your newsletter content here..."
                      rows={12}
                      required
                      className="bg-gray-900 border-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Tip: Use markdown formatting for better readability
                    </p>
                  </div>

                  {/* Preview */}
                  {campaignData.content && (
                    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Preview</h4>
                      <div className="bg-white text-gray-900 rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-2">{campaignData.subject || 'Subject Line'}</h2>
                        {campaignData.previewText && (
                          <p className="text-gray-600 mb-4">{campaignData.previewText}</p>
                        )}
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">{campaignData.content}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      <p>Will be sent to <strong className="text-white">{activeSubscribers}</strong> active subscribers</p>
                      <p className="text-xs text-gray-500 mt-1">Using Resend email service</p>
                    </div>
                    <Button
                      type="submit"
                      disabled={sending || !campaignData.subject || !campaignData.content}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sending ? 'Sending...' : 'Send Newsletter'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Setup Note */}
        <Card className="bg-yellow-900/20 border-yellow-600 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              Email Service Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-300">
            <p className="mb-4">
              Newsletter functionality uses Resend for email delivery. Make sure you have:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Resend API key configured in Settings</li>
              <li>Verified sender domain</li>
              <li>Email templates set up</li>
              <li>Unsubscribe link in all emails (required by law)</li>
            </ol>
            <p className="mt-4 text-sm">
              See <code className="bg-gray-900 px-2 py-1 rounded">Settings → Email</code> to configure Resend.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
