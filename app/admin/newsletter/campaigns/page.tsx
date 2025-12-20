'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Send, Eye, Edit, Trash2, Plus, Calendar, Users, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Template {
  id: string
  name: string
  description: string
  template_type: string
  html_content: string
  variables: any
}

interface Campaign {
  id: string
  title: string
  subject: string
  content: string
  template_type: string
  status: string
  scheduled_date: string | null
  sent_date: string | null
  recipient_count: number
  open_count: number
  click_count: number
  created_at: string
}

export default function NewsletterCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [isCreating, setIsCreating] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    template_type: '',
    scheduled_date: ''
  })

  useEffect(() => {
    fetchCampaigns()
    fetchTemplates()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/newsletter/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns)
      } else {
        setError('Failed to fetch campaigns')
      }
    } catch (err) {
      setError('Error fetching campaigns')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/newsletter/templates?active_only=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('admin_token')
      const url = editingCampaign 
        ? '/api/admin/newsletter/campaigns'
        : '/api/admin/newsletter/campaigns'
      
      const method = editingCampaign ? 'PUT' : 'POST'
      const payload = editingCampaign 
        ? { ...formData, id: editingCampaign.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess(editingCampaign ? 'Campaign updated successfully!' : 'Campaign created successfully!')
        setFormData({ title: '', subject: '', content: '', template_type: '', scheduled_date: '' })
        setIsCreating(false)
        setEditingCampaign(null)
        fetchCampaigns()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save campaign')
      }
    } catch (err) {
      setError('Error saving campaign')
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ campaign_id: campaignId })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(`Campaign sent successfully! ${data.stats.successful_sends} emails delivered.`)
        fetchCampaigns()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send campaign')
      }
    } catch (err) {
      setError('Error sending campaign')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/newsletter/campaigns?id=${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccess('Campaign deleted successfully!')
        fetchCampaigns()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete campaign')
      }
    } catch (err) {
      setError('Error deleting campaign')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      scheduled: 'secondary',
      sending: 'default',
      sent: 'default',
      failed: 'destructive'
    }
    
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>
  }

  const selectedTemplate = templates.find(t => t.template_type === formData.template_type)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Campaigns</h1>
          <p className="text-gray-600 mt-2">Create and manage your newsletter campaigns</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'sent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.recipient_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.length > 0 
                    ? Math.round(campaigns.reduce((sum, c) => sum + (c.recipient_count > 0 ? (c.open_count / c.recipient_count) * 100 : 0), 0) / campaigns.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage your newsletter campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{campaign.subject}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    {campaign.sent_date && (
                      <span>Sent: {new Date(campaign.sent_date).toLocaleDateString()}</span>
                    )}
                    <span>Recipients: {campaign.recipient_count}</span>
                    {campaign.open_count > 0 && (
                      <span>Opens: {campaign.open_count} ({Math.round((campaign.open_count / campaign.recipient_count) * 100)}%)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewCampaign(campaign)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {campaign.status === 'draft' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCampaign(campaign)
                          setFormData({
                            title: campaign.title,
                            subject: campaign.subject,
                            content: campaign.content,
                            template_type: campaign.template_type,
                            scheduled_date: campaign.scheduled_date || ''
                          })
                          setIsCreating(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendCampaign(campaign.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first newsletter campaign to get started.</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Campaign Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Update your campaign details' : 'Create a new newsletter campaign using professional templates'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Weekly Market Update - Dec 2024"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., 📈 This Week's Top Trading Signals"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="template_type">Template</Label>
              <Select
                value={formData.template_type}
                onValueChange={(value) => setFormData({ ...formData, template_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a professional template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.template_type}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Selected:</strong> {selectedTemplate.name} - {selectedTemplate.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="content">Newsletter Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your newsletter content here. This will be inserted into the selected template..."
                rows={12}
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Your content will be automatically formatted using the selected template. 
                Write in plain text or HTML - the template will handle the styling.
              </p>
            </div>

            <div>
              <Label htmlFor="scheduled_date">Schedule Date (Optional)</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to save as draft, or set a date to schedule for later
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setEditingCampaign(null)
                  setFormData({ title: '', subject: '', content: '', template_type: '', scheduled_date: '' })
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewCampaign} onOpenChange={() => setPreviewCampaign(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Preview</DialogTitle>
            <DialogDescription>
              Preview of "{previewCampaign?.title}"
            </DialogDescription>
          </DialogHeader>
          
          {previewCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Subject:</strong> {previewCampaign.subject}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusBadge(previewCampaign.status)}
                </div>
                <div>
                  <strong>Template:</strong> {previewCampaign.template_type}
                </div>
                <div>
                  <strong>Recipients:</strong> {previewCampaign.recipient_count}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Content:</h4>
                <div className="whitespace-pre-wrap text-sm bg-white p-4 rounded border">
                  {previewCampaign.content}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
