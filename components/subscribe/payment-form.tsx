"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Lock, Shield, Loader2 } from "lucide-react"
import { useState } from "react"
import { plans } from "./plan-comparison"

interface PaymentFormProps {
  selectedPlan: string
}

export function PaymentForm({ selectedPlan }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  const currentPlan = plans.find((plan) => plan.name === selectedPlan)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      alert("Please enter your email address")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: selectedPlan,
          email: email,
        }),
      })

      const { sessionId } = await response.json()

      const stripe = await import("@stripe/stripe-js").then((mod) =>
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
      )

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!currentPlan) {
    return <div>Please select a plan first</div>
  }

  return (
    <div className="max-w-2xl mx-auto mb-16">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <CreditCard className="w-6 h-6 text-teal-400" />
            <span>Complete Your Subscription</span>
          </CardTitle>
          <div className="text-center mt-4">
            <div className="text-2xl font-bold">{currentPlan.displayName} Plan</div>
            <div className="text-3xl font-bold text-teal-400">${currentPlan.price}/month</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-sm text-gray-400">
                We'll send your Discord invite and newsletter access to this email
              </p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Instant Discord community access</li>
                <li>• Weekly newsletter with market insights</li>
                <li>• All {currentPlan.displayName} plan features</li>
                <li>• Cancel anytime</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-black font-semibold py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Subscribe for ${currentPlan.price}/month</>
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>Encrypted</span>
            </div>
            <div>
              <span>Powered by Stripe</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
