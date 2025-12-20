"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, AlertCircle, ExternalLink, Rocket } from "lucide-react"

export function LaunchStatus() {
  const systems = [
    {
      name: "Database",
      status: "ready",
      description: "Supabase configured with all tables",
      details: ["Users table", "Subscriptions table", "Newsletter table", "RLS policies active"],
    },
    {
      name: "Payment System",
      status: "needs-setup",
      description: "Stripe integration ready, needs Price ID",
      details: ["Stripe keys configured", "Webhook endpoint ready", "Need to update Price ID"],
    },
    {
      name: "Discord Integration",
      status: "needs-setup",
      description: "Code ready, needs bot configuration",
      details: ["Discord API integration complete", "Need bot token", "Need server setup"],
    },
    {
      name: "Email System",
      status: "ready",
      description: "Resend configured with templates",
      details: ["API key configured", "Templates ready", "From email set"],
    },
    {
      name: "Frontend",
      status: "ready",
      description: "All pages and components complete",
      details: ["Landing page", "Subscribe page", "Admin dashboard", "Legal pages"],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "needs-setup":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case "needs-setup":
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Setup</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const readyCount = systems.filter((s) => s.status === "ready").length
  const totalCount = systems.length
  const progressPercent = Math.round((readyCount / totalCount) * 100)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Launch Status</h1>
        <div className="space-y-2">
          <div className="text-2xl font-semibold text-teal-600">{progressPercent}% Ready</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-teal-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-muted-foreground">
            {readyCount} of {totalCount} systems ready
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {systems.map((system, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(system.status)}
                <div>
                  <CardTitle className="text-lg">{system.name}</CardTitle>
                  <CardDescription>{system.description}</CardDescription>
                </div>
              </div>
              <div className="ml-auto">{getStatusBadge(system.status)}</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {system.details.map((detail, detailIndex) => (
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Next Steps</CardTitle>
          <CardDescription className="text-blue-700">
            Complete these final steps to launch your subscription platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Configure Stripe Product</h4>
            <p className="text-sm text-muted-foreground">Create $30/month product and update Price ID</p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer">
                Open Stripe Dashboard <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">2. Setup Discord Bot</h4>
            <p className="text-sm text-muted-foreground">Create bot and configure server permissions</p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">
                Discord Developer Portal <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">3. Test Complete Flow</h4>
            <p className="text-sm text-muted-foreground">Run end-to-end tests before going live</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/subscribe">Test Subscribe</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin">Admin Dashboard</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {progressPercent === 100 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              Ready to Launch! 
              <Rocket className="h-6 w-6" />
            </CardTitle>
            <CardDescription className="text-green-700">
              All systems are configured and ready for production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-green-600 hover:bg-green-700">Deploy to Production</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
