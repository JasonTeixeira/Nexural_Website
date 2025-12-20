'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Shield, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface StopLossManagerProps {
  position: {
    id: string
    ticker: string
    company_name: string
    entry_price: number
    current_price: number
    stop_loss: number
    shares: number
    direction: 'long' | 'short'
    risk_dollars?: number
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StopLossManager({ position, isOpen, onClose, onSuccess }: StopLossManagerProps) {
  const [newStopPrice, setNewStopPrice] = useState(position.stop_loss?.toString() || '')
  const [stopType, setStopType] = useState<'hard' | 'mental' | 'trailing'>('hard')
  const [reason, setReason] = useState('')
  const [sendToDiscord, setSendToDiscord] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateImpact = () => {
    const oldStop = position.stop_loss || 0
    const newStop = parseFloat(newStopPrice) || 0
    
    if (!newStop || !position.current_price) return null

    const oldRisk = Math.abs(position.entry_price - oldStop) * position.shares
    const newRisk = Math.abs(position.entry_price - newStop) * position.shares
    const riskChange = ((newRisk - oldRisk) / oldRisk) * 100

    const currentProfit = (position.current_price - position.entry_price) * position.shares
    const potentialReward = position.direction === 'long'
      ? (position.current_price - newStop) * position.shares
      : (newStop - position.current_price) * position.shares

    const oldRMultiple = oldRisk > 0 ? currentProfit / oldRisk : 0
    const newRMultiple = newRisk > 0 ? currentProfit / newRisk : 0

    return {
      oldRisk,
      newRisk,
      riskChange,
      newRMultiple,
      oldRMultiple,
      potentialReward,
      isRiskReduced: newRisk < oldRisk,
    }
  }

  const impact = calculateImpact()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStopPrice || !reason.trim()) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const newStop = parseFloat(newStopPrice)

      // Update position
      const { error: updateError } = await supabase
        .from('positions')
        .update({
          stop_loss: newStop,
          risk_dollars: impact?.newRisk || position.risk_dollars,
          updated_at: new Date().toISOString(),
        })
        .eq('id', position.id)

      if (updateError) throw updateError

      // Add to stop loss history
      const { error: historyError } = await supabase
        .from('stop_loss_history')
        .insert({
          position_id: position.id,
          old_stop_price: position.stop_loss,
          new_stop_price: newStop,
          stop_type: stopType,
          reason: reason.trim(),
          new_risk_dollars: impact?.newRisk,
          new_r_multiple: impact?.newRMultiple,
          discord_notified: sendToDiscord,
        })

      if (historyError) throw historyError

      // Log activity
      const { error: activityError } = await supabase
        .from('position_activity')
        .insert({
          position_id: position.id,
          activity_type: 'stop_moved',
          activity_category: 'risk',
          description: `Stop loss moved from $${position.stop_loss?.toFixed(2)} to $${newStop.toFixed(2)}`,
          reason: reason.trim(),
          old_value: { stop_loss: position.stop_loss },
          new_value: { stop_loss: newStop },
          impact_description: `Risk ${impact?.isRiskReduced ? 'reduced' : 'increased'} by ${Math.abs(impact?.riskChange || 0).toFixed(1)}%`,
          show_in_timeline: true,
          importance: 'high',
          discord_notified: sendToDiscord,
        })

      if (activityError) throw activityError

      // Send Discord notification if enabled
      if (sendToDiscord) {
        await fetch('/api/discord/stop-loss-moved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticker: position.ticker,
            companyName: position.company_name,
            oldStop: position.stop_loss,
            newStop: newStop,
            stopType: stopType,
            reason: reason.trim(),
            oldRisk: impact?.oldRisk,
            newRisk: impact?.newRisk,
            riskChange: impact?.riskChange,
            newRMultiple: impact?.newRMultiple,
            positionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/positions/${position.id}`,
          }),
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating stop loss:', error)
      alert('Failed to update stop loss. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Move Stop Loss - {position.ticker}
          </DialogTitle>
          <DialogDescription>
            {position.company_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status */}
          <div className="glass-card p-4 space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Entry</p>
                <p className="text-white font-semibold">${position.entry_price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current</p>
                <p className="text-white font-semibold">${position.current_price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Stop</p>
                <p className="text-red-400 font-semibold">${position.stop_loss?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* New Stop Price */}
          <div className="space-y-2">
            <Label htmlFor="newStop">New Stop Loss Price *</Label>
            <Input
              id="newStop"
              type="number"
              step="0.01"
              value={newStopPrice}
              onChange={(e) => setNewStopPrice(e.target.value)}
              placeholder="Enter new stop price"
              required
              className="text-lg"
            />
          </div>

          {/* Stop Type */}
          <div className="space-y-2">
            <Label htmlFor="stopType">Stop Type *</Label>
            <Select value={stopType} onValueChange={(value: any) => setStopType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Hard Stop (Auto-exit)
                  </div>
                </SelectItem>
                <SelectItem value="mental">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-yellow-400" />
                    Mental Stop (Manual)
                  </div>
                </SelectItem>
                <SelectItem value="trailing">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Trailing Stop (Dynamic)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Position up 5%, moving to break even to protect profits"
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Document why you're moving the stop. This helps with trade reviews.
            </p>
          </div>

          {/* Impact Analysis */}
          {impact && (
            <div className="glass-card p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Impact Analysis
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Old Risk</p>
                  <p className="text-white font-semibold">
                    ${impact.oldRisk.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">New Risk</p>
                  <p className={impact.isRiskReduced ? 'text-green-400' : 'text-red-400'}>
                    ${impact.newRisk.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risk Change</p>
                  <p className={impact.isRiskReduced ? 'text-green-400' : 'text-red-400'}>
                    {impact.riskChange > 0 ? '+' : ''}{impact.riskChange.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">New R-Multiple</p>
                  <p className="text-primary font-semibold">
                    {impact.newRMultiple.toFixed(2)}R
                  </p>
                </div>
              </div>

              {impact.isRiskReduced && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ Risk Reduced - Good management
                </Badge>
              )}
            </div>
          )}

          {/* Discord Toggle */}
          <div className="flex items-center justify-between glass-card p-4">
            <div className="space-y-0.5">
              <Label htmlFor="discord" className="text-sm font-semibold">
                Send to Discord
              </Label>
              <p className="text-xs text-muted-foreground">
                Notify members of stop loss adjustment
              </p>
            </div>
            <Switch
              id="discord"
              checked={sendToDiscord}
              onCheckedChange={setSendToDiscord}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !newStopPrice || !reason.trim()}>
              {isSubmitting ? 'Updating...' : 'Move Stop Loss'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
