'use client'

import { useEffect, useState } from 'react'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  Receipt, 
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function AccountPage() {
  const [subscription, setSubscription] = useState({
    tier: 'premium',
    status: 'active',
    billingCycle: 'monthly',
    nextPayment: '2025-11-07',
    amount: 30.00
  })

  const [invoices] = useState([
    { id: '1', date: '2025-10-07', amount: 49.99, status: 'paid' },
    { id: '2', date: '2025-09-07', amount: 49.99, status: 'paid' },
    { id: '3', date: '2025-08-07', amount: 49.99, status: 'paid' }
  ])

  const [usage] = useState({
    apiCalls: 1250,
    apiLimit: 10000,
    dataUsage: 2.5,
    dataLimit: 10
  })

  function handleUpgrade() {
    toast({
      title: 'Upgrade Available',
      description: 'Contact support to upgrade to Algo Trading tier.',
    })
  }

  function handleCancel() {
    toast({
      title: 'Cancel Subscription',
      description: 'Are you sure you want to cancel? This action cannot be undone.',
      variant: 'destructive'
    })
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-gray-400 mt-1">Manage your subscription and billing</p>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <Receipt className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Current Plan */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Current Plan</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 glass-card rounded-xl">
                      <div>
                        <h3 className="text-2xl font-bold capitalize">{subscription.tier} Plan</h3>
                        <p className="text-gray-400 mt-1">Billed {subscription.billingCycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">${subscription.amount}</p>
                        <p className="text-sm text-gray-400">per month</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 glass-card rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          <p className="font-medium">Status</p>
                        </div>
                        <Badge variant="default" className="capitalize">{subscription.status}</Badge>
                      </div>

                      <div className="p-4 glass-card rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-5 w-5 text-blue-400" />
                          <p className="font-medium">Next Payment</p>
                        </div>
                        <p className="text-lg font-semibold">
                          {new Date(subscription.nextPayment).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleUpgrade} className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Upgrade Plan
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Available Plans</CardTitle>
                  <CardDescription>Choose the plan that fits your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-6 glass-card rounded-xl">
                      <h3 className="text-xl font-bold mb-2">Newsletter & Discord</h3>
                      <p className="text-3xl font-bold mb-4">$30<span className="text-lg text-gray-400">/mo</span></p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          Trading signals
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          Swing positions
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          Discord access
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          Email newsletter
                        </li>
                      </ul>
                      <Badge variant="default">Current Plan</Badge>
                    </div>

                    <div className="p-6 glass-card rounded-xl border-2 border-purple-500/50">
                      <h3 className="text-xl font-bold mb-2">Algo Trading</h3>
                      <p className="text-3xl font-bold mb-4">$75<span className="text-lg text-gray-400">/mo</span></p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          Everything in Newsletter plan
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          Automated trading strategies
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          IB Gateway integration
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          Strategy builder
                        </li>
                      </ul>
                      <Button onClick={handleUpgrade} className="w-full">Upgrade</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-2xl">Billing History</CardTitle>
                <CardDescription>View and download your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 glass-card rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-600/20 rounded-lg">
                          <Receipt className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium">Invoice #{invoice.id}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${invoice.amount}</p>
                          <Badge variant="secondary" className="capitalize">{invoice.status}</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-2xl">Usage Statistics</CardTitle>
                <CardDescription>Monitor your account usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 glass-card rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">API Calls</h3>
                      <p className="text-sm text-gray-400">
                        {usage.apiCalls.toLocaleString()} / {usage.apiLimit.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: `${(usage.apiCalls / usage.apiLimit) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-6 glass-card rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Data Usage</h3>
                      <p className="text-sm text-gray-400">
                        {usage.dataUsage} GB / {usage.dataLimit} GB
                      </p>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                        style={{ width: `${(usage.dataUsage / usage.dataLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MemberPortalLayoutNew>
  )
}
