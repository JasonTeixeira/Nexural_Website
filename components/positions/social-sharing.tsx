'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Share2,
  Twitter,
  Link2,
  Code,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

interface Position {
  id: string
  ticker: string
  company_name: string
  direction: 'long' | 'short'
  entry_price: number
  current_price?: number
  unrealized_pnl?: number
  unrealized_pnl_pct?: number
  r_multiple_current?: number
  thesis?: string
  setup_type?: string
}

interface SocialSharingProps {
  position: Position
  baseUrl?: string
}

export function SocialSharing({ position, baseUrl = 'https://yourdomain.com' }: SocialSharingProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const positionUrl = `${baseUrl}/positions/${position.id}`

  // Generate Tweet text
  const generateTweetText = () => {
    const direction = position.direction === 'long' ? 'LONG' : 'SHORT'
    const pnl = position.unrealized_pnl
      ? position.unrealized_pnl >= 0
        ? `+${position.unrealized_pnl.toFixed(2)}`
        : position.unrealized_pnl.toFixed(2)
      : ''
    const pnlPct = position.unrealized_pnl_pct
      ? ` (${position.unrealized_pnl_pct >= 0 ? '+' : ''}${position.unrealized_pnl_pct.toFixed(1)}%)`
      : ''
    
    let tweet = `${direction} $${position.ticker} @ $${position.entry_price.toFixed(2)}`
    
    if (pnl) {
      tweet += `\n\nP&L: $${pnl}${pnlPct}`
    }

    if (position.r_multiple_current) {
      tweet += `\nR-Multiple: ${position.r_multiple_current.toFixed(2)}R`
    }

    if (position.setup_type) {
      tweet += `\n\n${position.setup_type.replace(/_/g, ' ').toUpperCase()} Setup`
    }

    tweet += `\n\n${positionUrl}\n\n#Trading #StockMarket`

    return encodeURIComponent(tweet)
  }

  // Share to Twitter
  const shareToTwitter = () => {
    const tweetText = generateTweetText()
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(positionUrl)
      setCopied('link')
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  // Generate embed code
  const generateEmbedCode = () => {
    const embedCode = `<iframe 
  src="${positionUrl}/embed" 
  width="400" 
  height="300" 
  frameborder="0" 
  scrolling="no"
  title="${position.ticker} Position"
></iframe>`
    return embedCode
  }

  // Copy embed code
  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode())
      setCopied('embed')
      toast.success('Embed code copied!')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Failed to copy embed code')
    }
  }

  // Generate shareable image text
  const generateShareText = () => {
    const direction = position.direction.toUpperCase()
    const pnl = position.unrealized_pnl
      ? `P&L: ${position.unrealized_pnl >= 0 ? '+' : ''}$${position.unrealized_pnl.toFixed(2)}`
      : ''
    const pnlPct = position.unrealized_pnl_pct
      ? ` (${position.unrealized_pnl_pct >= 0 ? '+' : ''}${position.unrealized_pnl_pct.toFixed(1)}%)`
      : ''
    
    return `${direction} ${position.ticker}
Entry: $${position.entry_price.toFixed(2)}
${position.current_price ? `Current: $${position.current_price.toFixed(2)}` : ''}
${pnl}${pnlPct}
${position.r_multiple_current ? `${position.r_multiple_current.toFixed(2)}R` : ''}`
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Position</DialogTitle>
          <DialogDescription>
            Share this {position.ticker} position with your followers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Share Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Twitter */}
            <Card className="premium-card cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={shareToTwitter}>
              <CardContent className="p-6 text-center">
                <Twitter className="w-8 h-8 mx-auto mb-3 text-[#1DA1F2]" />
                <h4 className="font-bold text-white mb-1">Twitter</h4>
                <p className="text-xs text-muted-foreground">Post to your feed</p>
              </CardContent>
            </Card>

            {/* Copy Link */}
            <Card className="premium-card cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={copyLink}>
              <CardContent className="p-6 text-center">
                {copied === 'link' ? (
                  <Check className="w-8 h-8 mx-auto mb-3 text-green-400" />
                ) : (
                  <Link2 className="w-8 h-8 mx-auto mb-3 text-primary" />
                )}
                <h4 className="font-bold text-white mb-1">Copy Link</h4>
                <p className="text-xs text-muted-foreground">Share anywhere</p>
              </CardContent>
            </Card>

            {/* Embed Code */}
            <Card className="premium-card cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={copyEmbedCode}>
              <CardContent className="p-6 text-center">
                {copied === 'embed' ? (
                  <Check className="w-8 h-8 mx-auto mb-3 text-green-400" />
                ) : (
                  <Code className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                )}
                <h4 className="font-bold text-white mb-1">Embed</h4>
                <p className="text-xs text-muted-foreground">Add to website</p>
              </CardContent>
            </Card>
          </div>

          {/* Position Preview Card */}
          <Card className="premium-card border-2">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="glass-card p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{position.ticker}</h3>
                    <p className="text-sm text-muted-foreground">{position.company_name}</p>
                  </div>
                  <div className={`text-right ${
                    (position.unrealized_pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.unrealized_pnl !== undefined && (
                      <>
                        <p className="text-xl font-bold">
                          {position.unrealized_pnl >= 0 ? '+' : ''}${position.unrealized_pnl.toFixed(2)}
                        </p>
                        <p className="text-sm">
                          ({position.unrealized_pnl_pct && position.unrealized_pnl_pct >= 0 ? '+' : ''}{position.unrealized_pnl_pct?.toFixed(2)}%)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Direction</span>
                    <span className="text-white font-semibold">{position.direction.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Entry</span>
                    <span className="text-white font-semibold">${position.entry_price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">R-Multiple</span>
                    <span className="text-white font-semibold">
                      {position.r_multiple_current?.toFixed(2) || '0.00'}R
                    </span>
                  </div>
                </div>

                {position.thesis && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                    {position.thesis}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Direct Link */}
          <div className="space-y-2">
            <Label>Direct Link</Label>
            <div className="flex gap-2">
              <Textarea
                value={positionUrl}
                readOnly
                rows={2}
                className="flex-1 font-mono text-sm"
              />
              <Button variant="outline" onClick={copyLink}>
                {copied === 'link' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="flex gap-2">
              <Textarea
                value={generateEmbedCode()}
                readOnly
                rows={5}
                className="flex-1 font-mono text-xs"
              />
              <Button variant="outline" onClick={copyEmbedCode}>
                {copied === 'embed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this code and paste it into your website to embed this position
            </p>
          </div>

          {/* Preview Link */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
            <div>
              <p className="text-sm font-semibold text-white">View Public Page</p>
              <p className="text-xs text-muted-foreground">See what others will see</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(positionUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Compact share button component
interface CompactShareProps {
  position: Position
  baseUrl?: string
}

export function CompactShare({ position, baseUrl }: CompactShareProps) {
  const positionUrl = `${baseUrl || 'https://yourdomain.com'}/positions/${position.id}`

  const shareToTwitter = () => {
    const direction = position.direction === 'long' ? 'LONG' : 'SHORT'
    const text = `${direction} $${position.ticker} @ $${position.entry_price.toFixed(2)}`
    const tweetText = encodeURIComponent(`${text}\n\n${positionUrl}\n\n#Trading`)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank', 'width=550,height=420')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(positionUrl)
      toast.success('Link copied!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={shareToTwitter}>
        <Twitter className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        <Link2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
