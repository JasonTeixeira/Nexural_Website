"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, Loader2 } from "lucide-react"

interface NewsletterSignupProps {
  title?: string
  description?: string
  buttonText?: string
  showBenefits?: boolean
}

export function NewsletterSignup({ 
  title = "Get Free Market Insights",
  description = "Join thousands of traders getting weekly market analysis and trading tips delivered to their inbox.",
  buttonText = "Subscribe Free",
  showBenefits = true
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setEmail("")
      } else {
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Newsletter signup error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-foreground">Welcome to Nexural!</h3>
          <p className="text-muted-foreground mb-4">
            You've successfully subscribed to our free newsletter. Check your email for a welcome message.
          </p>
          <p className="text-sm text-muted-foreground">
            Want more? <a href="/subscribe" className="text-cyan-400 hover:text-cyan-300 hover:underline">Upgrade to Discord access</a> for live discussions and premium signals.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-foreground">
          <Mail className="w-6 h-6 text-cyan-400" />
          <span>{title}</span>
        </CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-cyan-500 text-foreground"
              disabled={loading}
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>

          {showBenefits && (
            <div className="bg-card/30 p-4 rounded-lg border border-border/30">
              <h4 className="font-semibold mb-2 text-sm text-foreground">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Weekly market analysis and insights</li>
                <li>• Trading tips and strategies</li>
                <li>• Market trend predictions</li>
                <li>• Educational content for all skill levels</li>
                <li>• No spam, unsubscribe anytime</li>
              </ul>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            By subscribing, you agree to our{" "}
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/terms" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
