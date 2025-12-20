"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  MessageCircle, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2,
  TestTube,
  Database,
  Bot
} from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  data?: any
  timestamp: string
}

export function TestingDashboard() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [testEmail, setTestEmail] = useState("")
  const [testUserId, setTestUserId] = useState("")

  const addResult = (testName: string, result: TestResult) => {
    setResults(prev => ({
      ...prev,
      [testName]: {
        ...result,
        timestamp: new Date().toLocaleTimeString()
      }
    }))
  }

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(testName)
    try {
      const result = await testFn()
      addResult(testName, {
        success: true,
        message: result.message || "Test passed",
        data: result
      })
    } catch (error) {
      addResult(testName, {
        success: false,
        message: error instanceof Error ? error.message : "Test failed"
      })
    } finally {
      setLoading(null)
    }
  }

  // Email Tests
  const testNewsletterEmail = () => runTest("newsletter_email", async () => {
    const response = await fetch("/api/test/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "newsletter_welcome",
        email: testEmail,
        name: "Test User"
      })
    })
    return await response.json()
  })

  const testSubscriptionEmail = () => runTest("subscription_email", async () => {
    const response = await fetch("/api/test/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "subscription_welcome",
        email: testEmail,
        name: "Test User"
      })
    })
    return await response.json()
  })

  const testDiscordInviteEmail = () => runTest("discord_invite_email", async () => {
    const response = await fetch("/api/test/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "discord_invite",
        email: testEmail,
        name: "Test User"
      })
    })
    return await response.json()
  })

  // Discord Tests
  const testDiscordHealth = () => runTest("discord_health", async () => {
    const response = await fetch("/api/test/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "health_check" })
    })
    return await response.json()
  })

  const testDiscordInvite = () => runTest("discord_invite", async () => {
    const response = await fetch("/api/test/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_invite" })
    })
    return await response.json()
  })

  const testRoleAssignment = () => runTest("role_assignment", async () => {
    const response = await fetch("/api/test/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "test_role_assignment",
        userId: testUserId
      })
    })
    return await response.json()
  })

  // Newsletter Tests
  const testNewsletterSignup = () => runTest("newsletter_signup", async () => {
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail })
    })
    return await response.json()
  })

  // Stripe Tests
  const testStripeCheckout = () => runTest("stripe_checkout", async () => {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        planName: "basic",
        email: testEmail
      })
    })
    return await response.json()
  })

  const ResultBadge = ({ result }: { result?: TestResult }) => {
    if (!result) return <Badge variant="secondary">Not Run</Badge>
    
    return (
      <Badge variant={result.success ? "default" : "destructive"}>
        {result.success ? (
          <CheckCircle className="w-3 h-3 mr-1" />
        ) : (
          <XCircle className="w-3 h-3 mr-1" />
        )}
        {result.success ? "Pass" : "Fail"}
      </Badge>
    )
  }

  const TestButton = ({ 
    testName, 
    onClick, 
    children 
  }: { 
    testName: string
    onClick: () => void
    children: React.ReactNode 
  }) => (
    <Button
      onClick={onClick}
      disabled={loading === testName}
      className="w-full justify-start"
      variant="outline"
    >
      {loading === testName ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <TestTube className="w-4 h-4 mr-2" />
      )}
      {children}
    </Button>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Nexural Testing Dashboard</h1>
        <p className="text-gray-600">Test all systems to ensure everything is working perfectly</p>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Discord User ID (for Discord tests)</label>
            <Input
              placeholder="866138927940632647"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="email">Email Tests</TabsTrigger>
          <TabsTrigger value="discord">Discord Tests</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter Tests</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email System Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Newsletter Welcome</span>
                    <ResultBadge result={results.newsletter_email} />
                  </div>
                  <TestButton testName="newsletter_email" onClick={testNewsletterEmail}>
                    Test Newsletter Welcome Email
                  </TestButton>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subscription Welcome</span>
                    <ResultBadge result={results.subscription_email} />
                  </div>
                  <TestButton testName="subscription_email" onClick={testSubscriptionEmail}>
                    Test Subscription Welcome Email
                  </TestButton>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Discord Invite</span>
                    <ResultBadge result={results.discord_invite_email} />
                  </div>
                  <TestButton testName="discord_invite_email" onClick={testDiscordInviteEmail}>
                    Test Discord Invite Email
                  </TestButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discord" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Discord Integration Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bot Health</span>
                    <ResultBadge result={results.discord_health} />
                  </div>
                  <TestButton testName="discord_health" onClick={testDiscordHealth}>
                    Test Discord Bot Health
                  </TestButton>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Invite Creation</span>
                    <ResultBadge result={results.discord_invite} />
                  </div>
                  <TestButton testName="discord_invite" onClick={testDiscordInvite}>
                    Test Discord Invite Creation
                  </TestButton>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role Assignment</span>
                    <ResultBadge result={results.role_assignment} />
                  </div>
                  <TestButton testName="role_assignment" onClick={testRoleAssignment}>
                    Test Role Assignment
                  </TestButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Newsletter System Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Newsletter Signup</span>
                  <ResultBadge result={results.newsletter_signup} />
                </div>
                <TestButton testName="newsletter_signup" onClick={testNewsletterSignup}>
                  Test Newsletter Signup Flow
                </TestButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Stripe Payment Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Checkout Session</span>
                  <ResultBadge result={results.stripe_checkout} />
                </div>
                <TestButton testName="stripe_checkout" onClick={testStripeCheckout}>
                  Test Stripe Checkout Creation
                </TestButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(results).map(([testName, result]) => (
                <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{testName.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{result.timestamp}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
