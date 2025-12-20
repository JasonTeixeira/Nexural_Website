'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Minus,
  XCircle,
  Target,
  AlertCircle,
  TrendingUp,
  Clock,
  MessageSquare,
  Share2,
  CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PositionEvent {
  id: string
  event_type: 'entry' | 'add' | 'trim' | 'close' | 'target' | 'stop'
  shares: number
  price: number
  total_shares: number
  avg_price: number
  note?: string
  discord_sent: boolean
  created_at: string
}

interface PositionAdjustmentsProps {
  positionId: string
  ticker: string
  companyName: string
  currentShares: number
  currentAvgPrice: number
  currentPrice: number
  onUpdate?: () => void
}

export function PositionAdjustments({
  positionId,
  ticker,
  companyName,
  currentShares,
  currentAvgPrice,
  currentPrice,
  onUpdate,
}: PositionAdjustmentsProps) {
  const [events, setEvents] = useState<PositionEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTrimDialog, setShowTrimDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)

  // Form states
  const [shares, setShares] = useState('')
  const [price, setPrice] = useState(currentPrice.toString())
  const [note, setNote] = useState('')
  const [sendToDiscord, setSendToDiscord] = useState(true)

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'add':
        return <Plus className="w-4 h-4 text-blue-400" />
      case 'trim':
        return <Minus className="w-4 h-4 text-orange-400" />
      case 'close':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'target':
        return <Target className="w-4 h-4 text-emerald-400" />
      case 'stop':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getEventBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      entry: { label: 'ENTERED', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      add: { label: 'ADDED', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      trim: { label: 'TRIMMED', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      close: { label: 'CLOSED', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      target: { label: 'TARGET HIT', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      stop: { label: 'STOPPED OUT', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    }

    const badge = badges[type] || { label: type.toUpperCase(), className: '' }

    return (
      <Badge className={badge.className}>
        {badge.label}
      </Badge>
    )
  }

  const handleAddShares = async () => {
    if (!shares || !price) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/positions/${positionId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'add',
          shares: parseInt(shares),
          price: parseFloat(price),
          note,
          send_discord: sendToDiscord,
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setShares('')
        setNote('')
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error('Error adding shares:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrimShares = async () => {
    if (!shares || !price) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/positions/${positionId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'trim',
          shares: parseInt(shares),
          price: parseFloat(price),
          note,
          send_discord: sendToDiscord,
        }),
      })

      if (response.ok) {
        setShowTrimDialog(false)
        setShares('')
        setNote('')
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error('Error trimming shares:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClosePosition = async () => {
    if (!price) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/positions/${positionId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'close',
          shares: currentShares,
          price: parseFloat(price),
          note,
          send_discord: sendToDiscord,
        }),
      })

      if (response.ok) {
        setShowCloseDialog(false)
        setNote('')
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error('Error closing position:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Position Management
            </CardTitle>
            <CardDescription>Track adjustments and send signals to Discord</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Add Shares Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="hover:bg-green-500/10 hover:border-green-500/50">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add to {ticker}</DialogTitle>
                  <DialogDescription>
                    Increase your position in {companyName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-shares">Shares to Add</Label>
                    <Input
                      id="add-shares"
                      type="number"
                      placeholder="50"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-price">Price</Label>
                    <Input
                      id="add-price"
                      type="number"
                      step="0.01"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-note">Note (Optional)</Label>
                    <Textarea
                      id="add-note"
                      placeholder="Adding on pullback to support..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="add-discord"
                      checked={sendToDiscord}
                      onChange={(e) => setSendToDiscord(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="add-discord" className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Send signal to Discord
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddShares} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Shares'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Trim Shares Dialog */}
            <Dialog open={showTrimDialog} onOpenChange={setShowTrimDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="hover:bg-orange-500/10 hover:border-orange-500/50">
                  <Minus className="w-4 h-4 mr-2" />
                  Trim
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Trim {ticker}</DialogTitle>
                  <DialogDescription>
                    Reduce your position in {companyName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="trim-shares">Shares to Trim</Label>
                    <Input
                      id="trim-shares"
                      type="number"
                      placeholder="25"
                      max={currentShares}
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Max: {currentShares} shares
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trim-price">Price</Label>
                    <Input
                      id="trim-price"
                      type="number"
                      step="0.01"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trim-note">Note (Optional)</Label>
                    <Textarea
                      id="trim-note"
                      placeholder="Taking partial profits at resistance..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="trim-discord"
                      checked={sendToDiscord}
                      onChange={(e) => setSendToDiscord(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="trim-discord" className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Send signal to Discord
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTrimDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleTrimShares} disabled={loading}>
                    {loading ? 'Trimming...' : 'Trim Shares'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Close Position Dialog */}
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="hover:bg-red-500/10 hover:border-red-500/50">
                  <XCircle className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Close {ticker} Position</DialogTitle>
                  <DialogDescription>
                    Close entire position ({currentShares} shares) in {companyName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="close-price">Exit Price</Label>
                    <Input
                      id="close-price"
                      type="number"
                      step="0.01"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="close-note">Exit Reason</Label>
                    <Textarea
                      id="close-note"
                      placeholder="Target reached, taking full profits..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="close-discord"
                      checked={sendToDiscord}
                      onChange={(e) => setSendToDiscord(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="close-discord" className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Send signal to Discord
                    </Label>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-400 font-semibold">
                      ⚠️ This will close all {currentShares} shares
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleClosePosition} 
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {loading ? 'Closing...' : 'Close Position'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Position Summary */}
        <div className="glass-card p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Shares</p>
              <p className="text-2xl font-bold text-white">{currentShares}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Price</p>
              <p className="text-2xl font-bold text-white">${currentAvgPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <p className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Adjustment History */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Adjustment History
          </h4>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No adjustments yet</p>
              <p className="text-xs mt-1">Use the buttons above to add, trim, or close</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="glass-card p-4 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.event_type)}
                      {getEventBadge(event.event_type)}
                    </div>
                    <div className="flex items-center gap-2">
                      {event.discord_sent && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Discord
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 text-sm mb-2">
                    <div>
                      <span className="text-muted-foreground">Shares</span>
                      <p className="text-white font-semibold">
                        {event.event_type === 'add' ? '+' : event.event_type === 'trim' ? '-' : ''}
                        {event.shares}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price</span>
                      <p className="text-white font-semibold">${event.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total</span>
                      <p className="text-white font-semibold">{event.total_shares}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg</span>
                      <p className="text-white font-semibold">${event.avg_price.toFixed(2)}</p>
                    </div>
                  </div>

                  {event.note && (
                    <p className="text-sm text-muted-foreground italic mt-2 pl-6 border-l-2 border-primary/30">
                      "{event.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
