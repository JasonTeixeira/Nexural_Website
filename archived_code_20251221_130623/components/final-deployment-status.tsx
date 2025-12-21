"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Rocket, Users, CreditCard, Mail } from "lucide-react"

export function FinalDeploymentStatus() {
  const [isLive, setIsLive] = useState(true)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deployment Status
            <Badge variant="default" className="bg-green-500">
              Live & Ready
            </Badge>
          </CardTitle>
          <CardDescription>Your Nexural Trading subscription platform is fully operational</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium text-green-800">Payments</h4>
                <p className="text-sm text-green-600">Stripe configured</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium text-green-800">Discord</h4>
                <p className="text-sm text-green-600">Bot ready</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium text-green-800">Email</h4>
                <p className="text-sm text-green-600">Resend active</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium text-green-800">Database</h4>
                <p className="text-sm text-green-600">Supabase ready</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access your platform and admin tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4 bg-transparent" asChild>
              <a href="/subscribe" className="block">
                <CreditCard className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Subscribe Page</div>
                  <div className="text-sm text-muted-foreground">Customer subscription flow</div>
                </div>
              </a>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4 bg-transparent" asChild>
              <a href="/admin" className="block">
                <Users className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Admin Dashboard</div>
                  <div className="text-sm text-muted-foreground">Manage subscribers</div>
                </div>
              </a>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4 bg-transparent" asChild>
              <a href="/admin/newsletter" className="block">
                <Mail className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Newsletter</div>
                  <div className="text-sm text-muted-foreground">Send campaigns</div>
                </div>
              </a>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
              <ExternalLink className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Stripe Dashboard</div>
                <div className="text-sm text-muted-foreground">View payments</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
