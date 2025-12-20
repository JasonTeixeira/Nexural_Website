'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Send } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewPositionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sendDiscord, setSendDiscord] = useState(true)
  
  const [formData, setFormData] = useState({
    ticker: '',
    company_name: '',
    position_type: 'stock',
    direction: 'long',
    entry_price: '',
    shares: '',
    stop_loss: '',
    target: '',
    time_frame: 'swing',
    setup_type: '',
    entry_thesis: '',
    risk_dollars: '',
    risk_percent: '',
    tags: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Calculate risk if not provided
      const entryPrice = parseFloat(formData.entry_price)
      const shares = parseInt(formData.shares)
      const stopLoss = parseFloat(formData.stop_loss)
      
      const riskDollars = formData.risk_dollars ? 
        parseFloat(formData.risk_dollars) : 
        (entryPrice - stopLoss) * shares

      // Insert position
      const { data: position, error } = await supabase
        .from('positions')
        .insert({
          ticker: formData.ticker.toUpperCase(),
          company_name: formData.company_name,
          position_type: formData.position_type,
          direction: formData.direction,
          entry_price: entryPrice,
          entry_date: new Date().toISOString(),
          shares: shares,
          stop_loss: stopLoss,
          target: parseFloat(formData.target),
          status: 'open',
          time_frame: formData.time_frame,
          setup_type: formData.setup_type || null,
          entry_thesis: formData.entry_thesis || null,
          risk_dollars: riskDollars,
          risk_percent: formData.risk_percent ? parseFloat(formData.risk_percent) : null,
          tags: formData.tags.length > 0 ? formData.tags : null,
        })
        .select()
        .single()

      if (error) throw error

      // Send Discord notification if enabled
      if (sendDiscord && position) {
        await fetch('/api/discord/position-signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'position_opened',
            ticker: position.ticker,
            companyName: position.company_name,
            data: {
              entryPrice: position.entry_price,
              shares: position.shares,
              stopLoss: position.stop_loss,
              setupType: position.setup_type,
              riskDollars: position.risk_dollars,
              riskPercent: position.risk_percent,
              entryThesis: position.entry_thesis,
              timeFrame: position.time_frame,
            },
          }),
        })
      }

      // Redirect to position detail
      router.push(`/admin/positions/${position.id}`)
    } catch (error: any) {
      console.error('Error creating position:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const availableTags = [
    'breakout', 'momentum', 'swing', 'day', 'position',
    'pullback', 'reversal', 'technical', 'fundamental', 'high-risk'
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/positions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Positions
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Position</CardTitle>
          <CardDescription>
            Enter a new trading position. Discord notification will be sent automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticker">Ticker *</Label>
                  <Input
                    id="ticker"
                    value={formData.ticker}
                    onChange={e => setFormData({...formData, ticker: e.target.value})}
                    placeholder="NVDA"
                    required
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                    placeholder="NVIDIA Corporation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_frame">Timeframe *</Label>
                  <Select
                    value={formData.time_frame}
                    onValueChange={value => setFormData({...formData, time_frame: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Trade</SelectItem>
                      <SelectItem value="swing">Swing (Days-Weeks)</SelectItem>
                      <SelectItem value="position">Position (Weeks-Months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="setup_type">Setup Type</Label>
                  <Input
                    id="setup_type"
                    value={formData.setup_type}
                    onChange={e => setFormData({...formData, setup_type: e.target.value})}
                    placeholder="Bull Flag, Breakout, etc."
                  />
                </div>
              </div>
            </div>

            {/* Entry Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Entry Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entry_price">Entry Price *</Label>
                  <Input
                    id="entry_price"
                    type="number"
                    step="0.01"
                    value={formData.entry_price}
                    onChange={e => setFormData({...formData, entry_price: e.target.value})}
                    placeholder="485.50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shares">Shares *</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={formData.shares}
                    onChange={e => setFormData({...formData, shares: e.target.value})}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stop_loss">Stop Loss *</Label>
                  <Input
                    id="stop_loss"
                    type="number"
                    step="0.01"
                    value={formData.stop_loss}
                    onChange={e => setFormData({...formData, stop_loss: e.target.value})}
                    placeholder="462.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target *</Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: e.target.value})}
                    placeholder="515.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Risk Management</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="risk_dollars">Risk Amount ($)</Label>
                  <Input
                    id="risk_dollars"
                    type="number"
                    step="0.01"
                    value={formData.risk_dollars}
                    onChange={e => setFormData({...formData, risk_dollars: e.target.value})}
                    placeholder="Auto-calculated if empty"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to auto-calculate from entry/stop
                  </p>
                </div>
                <div>
                  <Label htmlFor="risk_percent">Risk % of Portfolio</Label>
                  <Input
                    id="risk_percent"
                    type="number"
                    step="0.1"
                    value={formData.risk_percent}
                    onChange={e => setFormData({...formData, risk_percent: e.target.value})}
                    placeholder="1.5"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Entry Thesis */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Entry Thesis</h3>
              <Textarea
                value={formData.entry_thesis}
                onChange={e => setFormData({...formData, entry_thesis: e.target.value})}
                placeholder="Why are you entering this trade? What's your setup? What do you expect?"
                rows={4}
              />
            </div>

            {/* Discord Toggle */}
            <div className="flex items-center gap-2 p-4 bg-accent rounded-lg">
              <input
                type="checkbox"
                id="send_discord"
                checked={sendDiscord}
                onChange={e => setSendDiscord(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="send_discord" className="cursor-pointer">
                Send Discord notification (recommended)
              </Label>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  'Creating...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Position
                  </>
                )}
              </Button>
              {sendDiscord && (
                <Button type="button" variant="outline" disabled>
                  <Send className="w-4 h-4 mr-2" />
                  + Discord Signal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
