"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Gift, TrendingUp } from "lucide-react"

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true)
        setHasShown(true)
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [hasShown])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    console.log("Email submitted:", email)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              <DialogTitle className="text-xl font-semibold">Wait! Don't Miss Out</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            
            <h3 className="text-lg font-semibold mb-2">JOIN THE NEWSLETTER</h3>
            <p className="text-muted-foreground text-sm">
              Join investors and get instant access to our stock analysis system and community
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">What you'll get:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Weekly watchlist picks from Sage</li>
              <li>• Complete analysis & price targets</li>
              <li>• Risk assessment & entry points</li>
              <li>• Free TradingView indicators</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Get My Free Stock Picks
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">No spam. Unsubscribe anytime. 100% free.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
