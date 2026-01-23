'use client'

import { useMemo, useState } from 'react'
import { MoreHorizontal, Shield, Flag, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBlocking } from '@/hooks/use-blocking'

type ReportTargetType = 'user' | 'post' | 'portfolio' | 'position_share'
type ReportReason = 'spam' | 'harassment' | 'hate' | 'scam' | 'nsfw' | 'misinformation' | 'other'

export function ReportBlockMenu(props: {
  actorUserId?: string | null
  targetType: ReportTargetType
  targetId: string
  align?: 'start' | 'end'
}) {
  const { actorUserId, targetType, targetId, align = 'end' } = props
  const blocking = useBlocking()
  const isBlocked = blocking.isBlocked(actorUserId)

  const [openReport, setOpenReport] = useState(false)
  const [reason, setReason] = useState<ReportReason>('spam')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const canBlock = useMemo(() => !!actorUserId, [actorUserId])

  async function submitReport() {
    setSubmitting(true)
    setStatus(null)
    try {
      const res = await fetch('/api/member/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details.trim() || null,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Failed to report')
      setStatus(j.alreadyReported ? 'Already reported. Thanks.' : 'Report submitted. Thanks.' )
      setDetails('')
    } catch (e: any) {
      setStatus(e?.message || 'Failed to report')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleBlock() {
    if (!actorUserId) return
    try {
      await blocking.action(actorUserId, isBlocked ? 'unblock' : 'block')
    } catch (e) {
      console.warn('block action failed', e)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white"
            data-testid={`safety-menu-trigger:${targetType}:${targetId}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenReport(true)} data-testid={`safety-menu-report:${targetType}:${targetId}`}>
            <Flag className="h-4 w-4 mr-2" />
            Report
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canBlock} onClick={() => void toggleBlock()} data-testid={`safety-menu-block:${targetType}:${targetId}`}>
            <UserX className="h-4 w-4 mr-2" />
            {isBlocked ? 'Unblock user' : 'Block user'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openReport} onOpenChange={setOpenReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report content</DialogTitle>
            <DialogDescription>
              Help us keep the community clean. Reports go to the moderation queue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="hate">Hate</SelectItem>
                  <SelectItem value="scam">Scam</SelectItem>
                  <SelectItem value="nsfw">NSFW</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Details (optional)</Label>
              <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} />
            </div>

            {status ? (
              <Badge variant="secondary" className="bg-white/10 text-white/80">
                {status}
              </Badge>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReport(false)} disabled={submitting}>
              Close
            </Button>
            <Button onClick={() => void submitReport()} disabled={submitting} data-testid={`report-submit:${targetType}:${targetId}`}>
              {submitting ? 'Submitting…' : 'Submit report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
