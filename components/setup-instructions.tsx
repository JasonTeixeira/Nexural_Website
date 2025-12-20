"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ExternalLink } from "lucide-react"

export function SetupInstructions() {
  const steps = [
    {
      title: "Stripe Product Setup",
      description: "Create $30/month subscription product",
      completed: false,
      link: "https://dashboard.stripe.com/products",
      details: [
        "Create product: 'Nexural Trading Basic Plan'",
        "Set price: $30/month recurring",
        "Copy the Price ID",
        "Update code with real Price ID",
      ],
    },
    {
      title: "Discord Bot Setup",
      description: "Configure Discord bot and server",
      completed: false,
      link: "https://discord.com/developers/applications",
      details: [
        "Create Discord application",
        "Add bot to your server",
        "Create 'Subscriber' role",
        "Copy bot token to env vars",
      ],
    },
    {
      title: "Environment Variables",
      description: "Add required environment variables",
      completed: false,
      details: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "DISCORD_BOT_TOKEN", "STRIPE_WEBHOOK_SECRET"],
    },
    {
      title: "Deploy & Test",
      description: "Deploy to production and test flow",
      completed: false,
      details: [
        "Deploy to Vercel with domain",
        "Test subscription flow",
        "Verify Discord invite works",
        "Test email notifications",
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Setup Instructions</h1>
        <p className="text-muted-foreground">Complete these steps to launch your subscription platform</p>
      </div>

      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="relative">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
                <div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              </div>
              {step.link && (
                <a href={step.link} target="_blank" rel="noopener noreferrer" className="ml-auto">
                  <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Ready to Launch!</CardTitle>
          <CardDescription className="text-green-700">
            Once all steps are complete, your subscription platform will be live
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Badge variant="secondary">Database: Ready</Badge>
            <Badge variant="secondary">Payment System: Ready</Badge>
            <Badge variant="secondary">Email System: Ready</Badge>
            <Badge variant="secondary">Discord Integration: Ready</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
