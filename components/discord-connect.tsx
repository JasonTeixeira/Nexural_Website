"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, Loader2 } from "lucide-react"

interface DiscordConnectProps {
  userEmail?: string
}

export function DiscordConnect({ userEmail }: DiscordConnectProps) {
  const [email, setEmail] = useState(userEmail || "")
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!email) {
      alert("Please enter your email address")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to Discord OAuth
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to initiate Discord connection")
      }
    } catch (error) {
      console.error("Error connecting to Discord:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-[#5865F2]" />
          <span>Connect to Discord</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <p className="text-sm text-gray-400">Use the same email address from your subscription</p>
        </div>

        <Button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 mr-2" />
              Connect Discord Account
            </>
          )}
        </Button>

        <div className="text-sm text-gray-400">
          <p>This will:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Add you to our private Discord server</li>
            <li>Assign you the appropriate role based on your plan</li>
            <li>Give you access to exclusive channels</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
