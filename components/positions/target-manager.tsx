'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Target, TrendingUp, DollarSign, Percent, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface PositionTarget {
  id?: string
  target_number: number
  target_price: number
  percent_allocation: number
  r_multiple: number
  status: 'active' | 'hit' | 'removed'
  hit_at?: string
  hit_price?: number
}

interface TargetManagerProps {
  position: {
    id: string
    ticker: string
    company_name: string
    entry_price: number
    current_price: number
    stop_loss: number
    shares: number
    direction: 'long' | 'short'
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TargetManager({ position, isOpen, onClose, onSuccess }: TargetManagerProps) {
  const [targets, setTargets] = useState<PositionTarget[]>([
    { target_number: 1, target_price: 0, percent_allocation: 50, r_multiple: 0, status: 'active' },
    { target_number: 2, target_price: 0, percent_allocation: 30, r_multiple: 0, status: 'active' },
    { target_number: 3, target_price: 0, percent_allocation: 20, r_multiple: 0, status: 'active' },
  ])
  const [note, setNote] = useState('')
  const [sendToDiscord, setSendToDiscord] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadExistingTargets()
    }
  }, [isOpen, position.id])

  const loadExistingTargets = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('position_targets')
        .select('*')
        .eq('position_id', position.id)
        .order('target_number')

      if (error) throw error

      if (data && data.length > 0) {
        setTargets(data.map(t => ({
          id: t.id,
          target_number: t.target_number,
          target_price: t.target_price,
          percent_allocation: t.percent_allocation,
          r_multiple: t.r_multiple,
          status: t.status,
          hit_at: t.hit_at,
          hit_price: t.hit_price,
        })))
      }
    } catch (error) {
      console.error('Error loading targets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateRMultiple = (targetPrice: number): number => {
    if (!position.stop_loss || !position.entry_price) return 0
    
    const risk = Math.abs(position.entry_price - position.stop_loss)
    const reward = Math.abs(targetPrice - position.entry_price)
    
    return risk > 0 ? reward / risk : 0
  }

  const updateTarget = (index: number, field: keyof PositionTarget, value: any) => {
    const newTargets = [...targets]
    newTargets[index] = { ...newTargets[index], [field]: value }
    
    // Auto-calculate R-multiple when price changes
    if (field === 'target_price') {
      newTargets[index].r_multiple = calculateRMultiple(parseFloat(value))
    }
    
    setTargets(newTargets)
  }

  const addTarget = () => {
    const nextNumber = Math.max(...targets.map(t => t.target_number), 0) + 1
    setTargets([
      ...targets,
      {
        target_number: nextNumber,
        target_price: 0,
        percent_allocation: 0,
        r_multiple: 0,
        status: 'active',
      }
    ])
  }

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index))
  }

  const getTotalAllocation = (): number => {
    return targets.reduce((sum, t) => sum + (t.percent_allocation || 0), 0)
  }

  const isAllocationValid = (): boolean => {
    const total = getTotalAllocation()
    return total === 100
  }

  const calculateImpact = () => {
    const activeTargets = targets.filter(t => t.target_price > 0 && t.percent_allocation > 0)
    if (activeTargets.length === 0) return null

    const totalShares = position.shares
    const projectedProfits = activeTargets.map(t => {
      const sharesAtTarget = Math.floor(totalShares * (t.percent_allocation / 100))
      const profitPerShare = Math.abs(t.target_price - position.entry_price)
      return {
        target: t.target_number,
        shares: sharesAtTarget,
        profit: sharesAtTarget * profitPerShare,
        rMultiple: t.r_multiple,
      }
    })

    const totalProfit = projectedProfits.reduce((sum, p) => sum + p.profit, 0)
    const weightedRMultiple = projectedProfits.reduce((sum, p) => 
      sum + (p.rMultiple * (p.shares / totalShares)), 0
    )

    return {
      projectedProfits,
      totalProfit,
      weightedRMultiple,
    }
  }

  const impact = calculateImpact()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAllocationValid()) {
      alert('Total allocation must equal 100%')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Delete existing targets
      await supabase
        .from('position_targets')
        .delete()
        .eq('position_id', position.id)

      // Insert new targets
      const targetsToInsert = targets
        .filter(t => t.target_price > 0 && t.percent_allocation > 0)
        .map(t => ({
          position_id: position.id,
          target_number: t.target_number,
          target_price: t.target_price,
          percent_allocation: t.percent_allocation,
          r_multiple: t.r_multiple,
          status: t.status || 'active',
        }))

      if (targetsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('position_targets')
          .insert(targetsToInsert)

        if (insertError) throw insertError
      }

      // Log activity
      const { error: activityError } = await supabase
        .from('position_activity')
        .insert({
          position_id: position.id,
          activity_type: 'targets_updated',
          activity_category: 'trade',
          description: `Updated profit targets: ${targetsToInsert.length} targets set`,
          metadata: { targets: targetsToInsert },
          show_in_timeline: true,
          importance: 'normal',
          discord_notified: sendToDiscord,
        })

      if (activityError) throw activityError

      // Add note if provided
      if (note.trim()) {
        await supabase
          .from('position_notes')
          .insert({
            position_id: position.id,
            note_type: 'adjustment',
            content: note.trim(),
            importance: 'normal',
            show_in_discord: sendToDiscord,
          })
      }

      // Send Discord notification if enabled
      if (sendToDiscord && targetsToInsert.length > 0) {
        await fetch('/api/discord/targets-updated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticker: position.ticker,
            companyName: position.company_name,
            targets: targetsToInsert,
            totalProfit: impact?.totalProfit,
            weightedRMultiple: impact?.weightedRMultiple,
            note: note.trim(),
            positionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/positions/${position.id}`,
          }),
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating targets:', error)
      alert('Failed to update targets. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkHit = async (targetId: string, targetNumber: number, targetPrice: number) => {
    if (!confirm(`Mark Target ${targetNumber} as hit at $${targetPrice.toFixed(2)}?`)) return

    try {
      const supabase = createClient()

      // Update target status
      const { error: updateError } = await supabase
        .from('position_targets')
        .update({
          status: 'hit',
          hit_at: new Date().toISOString(),
          hit_price: position.current_price,
        })
        .eq('id', targetId)

      if (updateError) throw updateError

      // Log activity
      await supabase
        .from('position_activity')
        .insert({
          position_id: position.id,
          activity_type: 'target_hit',
          activity_category: 'trade',
          description: `Target ${targetNumber} hit at $${position.current_price.toFixed(2)}`,
          metadata: { target_number: targetNumber, target_price: targetPrice, hit_price: position.current_price },
          show_in_timeline: true,
          importance: 'high',
          discord_notified: true,
        })

      // Send Discord notification
      await fetch('/api/discord/target-hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: position.ticker,
          companyName: position.company_name,
          targetNumber,
          targetPrice,
          hitPrice: position.current_price,
          positionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/positions/${position.id}`,
        }),
      })

      onSuccess()
      loadExistingTargets()
    } catch (error) {
      console.error('Error marking target as hit:', error)
      alert('Failed to mark target as hit')
    }
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <p>Loading targets...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Manage Profit Targets - {position.ticker}
          </DialogTitle>
          <DialogDescription>
            {position.company_name} | Entry: ${position.entry_price?.toFixed(2)} | Current: ${position.current_price?.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Targets List */}
          <div className="space-y-4">
            {targets.map((target, index) => (
              <div key={index} className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">T{target.target_number}</Badge>
                    {target.status === 'hit' && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Hit
                      </Badge>
                    )}
                  </div>
                  {targets.length > 1 && target.status !== 'hit' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTarget(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Target Price */}
                  <div className="space-y-1">
                    <Label className="text-xs">Target Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={target.target_price || ''}
                      onChange={(e) => updateTarget(index, 'target_price', e.target.value)}
                      placeholder="0.00"
                      disabled={target.status === 'hit'}
                      required
                    />
                  </div>

                  {/* Allocation */}
                  <div className="space-y-1">
                    <Label className="text-xs">Allocation %</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={target.percent_allocation || ''}
                      onChange={(e) => updateTarget(index, 'percent_allocation', parseFloat(e.target.value))}
                      placeholder="0"
                      disabled={target.status === 'hit'}
                      required
                    />
                  </div>
                </div>

                {/* Calculated Values */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">R-Multiple</p>
                    <p className="text-primary font-semibold">
                      {target.r_multiple > 0 ? `${target.r_multiple.toFixed(2)}R` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shares</p>
                    <p className="text-white font-semibold">
                      {Math.floor(position.shares * (target.percent_allocation / 100))}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Projected Profit</p>
                    <p className="text-green-400 font-semibold">
                      ${(Math.floor(position.shares * (target.percent_allocation / 100)) * 
                         Math.abs(target.target_price - position.entry_price)).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Mark as Hit Button */}
                {target.status === 'active' && target.id && position.current_price >= target.target_price && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full border-green-500/30 text-green-400"
                    onClick={() => handleMarkHit(target.id!, target.target_number, target.target_price)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Target {target.target_number} as Hit
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add Target Button */}
          {targets.length < 5 && (
            <Button
              type="button"
              variant="outline"
              onClick={addTarget}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Target
            </Button>
          )}

          {/* Allocation Summary */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Total Allocation</span>
              <span className={`text-lg font-bold ${isAllocationValid() ? 'text-green-400' : 'text-red-400'}`}>
                {getTotalAllocation()}%
              </span>
            </div>
            {!isAllocationValid() && (
              <p className="text-xs text-red-400">
                Total must equal 100%. Current: {getTotalAllocation()}%
              </p>
            )}
          </div>

          {/* Impact Analysis */}
          {impact && (
            <div className="glass-card p-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Projected Impact
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Projected Profit</p>
                  <p className="text-green-400 font-bold text-lg">
                    ${impact.totalProfit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weighted R-Multiple</p>
                  <p className="text-primary font-bold text-lg">
                    {impact.weightedRMultiple.toFixed(2)}R
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                {impact.projectedProfits.map(p => (
                  <div key={p.target} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">T{p.target}: {p.shares} shares</span>
                    <span className="text-green-400">+${p.profit.toFixed(2)} ({p.rMultiple.toFixed(2)}R)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., Scaling out as price approaches resistance..."
              rows={2}
            />
          </div>

          {/* Discord Toggle */}
          <div className="flex items-center justify-between glass-card p-4">
            <div className="space-y-0.5">
              <Label htmlFor="discord" className="text-sm font-semibold">
                Send to Discord
              </Label>
              <p className="text-xs text-muted-foreground">
                Notify members of target updates
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
            <Button 
              type="submit" 
              disabled={isSubmitting || !isAllocationValid()}
            >
              {isSubmitting ? 'Saving...' : 'Save Targets'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
