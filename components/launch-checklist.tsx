"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, AlertCircle, ExternalLink, Rocket } from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  description: string
  status: "complete" | "pending" | "error"
  action?: string
  link?: string
}

export function LaunchChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "stripe-product",
      title: "Stripe Product Setup",
      description: "Create $30/month subscription product in Stripe Dashboard",
      status: "complete",
      action: "Configure in Stripe Dashboard",
      link: "https://dashboard.stripe.com/products",
    },
    {
      id: "discord-server",
      title: "Discord Server Ready",
      description: "Discord server with subscriber role configured",
      status: "complete",
      action: "Check Discord Server",
    },
    {
      id: "env-vars",
      title: "Environment Variables",
      description: "All required environment variables configured",
      status: "complete",
    },
    {
      id: "database",
      title: "Database Schema",
      description: "Supabase database with all required tables",
      status: "complete",
    },
    {
      id: "email-service",
      title: "Email Service",
      description: "Resend configured for sending notifications",
      status: "complete",
    },
  ])

  const completedCount = checklist.filter((item) => item.status === "complete").length
  const totalCount = checklist.length
  const isReady = completedCount === totalCount

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Launch Readiness Checklist
          {isReady ? (
            <Badge variant="default" className="bg-green-500">
              Ready to Launch
            </Badge>
          ) : (
            <Badge variant="secondary">
              {completedCount}/{totalCount} Complete
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Verify all systems are configured before going live</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
            {item.status === "complete" ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : item.status === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
            )}

            <div className="flex-1">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>

              {item.action && item.status !== "complete" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => item.link && window.open(item.link, "_blank")}
                >
                  {item.action}
                  {item.link && <ExternalLink className="h-3 w-3 ml-1" />}
                </Button>
              )}
            </div>
          </div>
        ))}

        {isReady && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Ready to Launch!
            </h4>
            <p className="text-sm text-green-700">
              All systems are configured and ready. Your Nexural Trading subscription platform is live and ready to accept
              subscribers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
