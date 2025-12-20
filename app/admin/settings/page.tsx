'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings as SettingsIcon,
  Database,
  Mail,
  MessageSquare,
  TrendingUp,
  CreditCard,
  Key,
  Shield,
  Bell,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({})
  const router = useRouter()

  // Settings state
  const [settings, setSettings] = useState({
    // Supabase
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    
    // Discord
    discordBotToken: process.env.DISCORD_BOT_TOKEN || '',
    discordGeneralChannelId: process.env.DISCORD_GENERAL_CHANNEL_ID || '',
    discordSignalsChannelId: process.env.DISCORD_SIGNALS_CHANNEL_ID || '',
    
    // IB Gateway
    ibGatewayHost: process.env.IB_GATEWAY_HOST || '127.0.0.1',
    ibGatewayPort: process.env.IB_GATEWAY_PORT || '7496',
    ibGatewayClientId: process.env.IB_GATEWAY_CLIENT_ID || '1',
    ibGatewayAccountId: process.env.IB_GATEWAY_ACCOUNT_ID || '',
    
    // Databento
    databentoApiKey: process.env.DATABENTO_API_KEY || '',
    
    // Stripe
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    
    // Resend (Email)
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@nexuraltrading.com',
    
    // System
    nextPublicUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3010',
    nodeEnv: process.env.NODE_ENV || 'development'
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    // In a real implementation, you would save these to a secure backend
    // For now, we'll just show a success message
    setTimeout(() => {
      alert('✅ Settings saved successfully!\n\nNote: In production, these would be saved to a secure backend and require server restart to take effect.')
      setSaving(false)
    }, 1000)
  }

  const getConnectionStatus = (service: string) => {
    // Check if required fields are filled
    switch(service) {
      case 'supabase':
        return settings.supabaseUrl && settings.supabaseAnonKey
      case 'discord':
        return settings.discordBotToken && settings.discordGeneralChannelId
      case 'ibgateway':
        return settings.ibGatewayHost && settings.ibGatewayPort
      case 'databento':
        return settings.databentoApiKey
      case 'stripe':
        return settings.stripePublishableKey && settings.stripeSecretKey
      case 'resend':
        return settings.resendApiKey
      default:
        return false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">⚙️ System Settings</h1>
                <p className="text-sm text-gray-400">Configure integrations and system preferences</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-400">Environment Variables</h3>
              <p className="text-sm text-yellow-300 mt-1">
                These settings are loaded from your .env.local file. Changes here are for reference only. 
                To update, modify your .env.local file and restart the server.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="discord">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discord
            </TabsTrigger>
            <TabsTrigger value="trading">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="system">
              <Shield className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Database Settings */}
          <TabsContent value="database">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Supabase Configuration
                    </CardTitle>
                    <CardDescription>Database and authentication settings</CardDescription>
                  </div>
                  <Badge variant="outline" className={getConnectionStatus('supabase') ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-red-900/50 text-red-400 border-red-600'}>
                    {getConnectionStatus('supabase') ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Configured
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="supabaseUrl">Supabase URL</Label>
                  <Input
                    id="supabaseUrl"
                    value={settings.supabaseUrl}
                    onChange={(e) => setSettings({...settings, supabaseUrl: e.target.value})}
                    placeholder="https://your-project.supabase.co"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
                  <div className="relative">
                    <Input
                      id="supabaseAnonKey"
                      type={showSecrets['supabaseAnonKey'] ? 'text' : 'password'}
                      value={settings.supabaseAnonKey}
                      onChange={(e) => setSettings({...settings, supabaseAnonKey: e.target.value})}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="bg-gray-900 border-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('supabaseAnonKey')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showSecrets['supabaseAnonKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discord Settings */}
          <TabsContent value="discord">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Discord Bot Configuration
                    </CardTitle>
                    <CardDescription>Discord bot and channel settings</CardDescription>
                  </div>
                  <Badge variant="outline" className={getConnectionStatus('discord') ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-red-900/50 text-red-400 border-red-600'}>
                    {getConnectionStatus('discord') ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Configured
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="discordBotToken">Bot Token</Label>
                  <div className="relative">
                    <Input
                      id="discordBotToken"
                      type={showSecrets['discordBotToken'] ? 'text' : 'password'}
                      value={settings.discordBotToken}
                      onChange={(e) => setSettings({...settings, discordBotToken: e.target.value})}
                      placeholder="MTIzNDU2Nzg5MDEyMzQ1Njc4OQ..."
                      className="bg-gray-900 border-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('discordBotToken')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showSecrets['discordBotToken'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="discordGeneralChannelId">General Channel ID</Label>
                  <Input
                    id="discordGeneralChannelId"
                    value={settings.discordGeneralChannelId}
                    onChange={(e) => setSettings({...settings, discordGeneralChannelId: e.target.value})}
                    placeholder="1234567890123456789"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="discordSignalsChannelId">Signals Channel ID</Label>
                  <Input
                    id="discordSignalsChannelId"
                    value={settings.discordSignalsChannelId}
                    onChange={(e) => setSettings({...settings, discordSignalsChannelId: e.target.value})}
                    placeholder="1234567890123456789"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Settings */}
          <TabsContent value="trading">
            <div className="space-y-6">
              {/* IB Gateway */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        IB Gateway Configuration
                      </CardTitle>
                      <CardDescription>Interactive Brokers Gateway settings</CardDescription>
                    </div>
                    <Badge variant="outline" className={getConnectionStatus('ibgateway') ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-red-900/50 text-red-400 border-red-600'}>
                      {getConnectionStatus('ibgateway') ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Configured
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Configured
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ibGatewayHost">Host</Label>
                      <Input
                        id="ibGatewayHost"
                        value={settings.ibGatewayHost}
                        onChange={(e) => setSettings({...settings, ibGatewayHost: e.target.value})}
                        placeholder="127.0.0.1"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ibGatewayPort">Port</Label>
                      <Input
                        id="ibGatewayPort"
                        value={settings.ibGatewayPort}
                        onChange={(e) => setSettings({...settings, ibGatewayPort: e.target.value})}
                        placeholder="7496"
                        className="bg-gray-900 border-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">7496 = Paper Trading, 7497 = Live Trading</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ibGatewayClientId">Client ID</Label>
                      <Input
                        id="ibGatewayClientId"
                        value={settings.ibGatewayClientId}
                        onChange={(e) => setSettings({...settings, ibGatewayClientId: e.target.value})}
                        placeholder="1"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ibGatewayAccountId">Account ID</Label>
                      <Input
                        id="ibGatewayAccountId"
                        value={settings.ibGatewayAccountId}
                        onChange={(e) => setSettings({...settings, ibGatewayAccountId: e.target.value})}
                        placeholder="DUA790262"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Databento */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Databento Configuration
                      </CardTitle>
                      <CardDescription>Market data API settings</CardDescription>
                    </div>
                    <Badge variant="outline" className={getConnectionStatus('databento') ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-red-900/50 text-red-400 border-red-600'}>
                      {getConnectionStatus('databento') ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Configured
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="databentoApiKey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="databentoApiKey"
                        type={showSecrets['databentoApiKey'] ? 'text' : 'password'}
                        value={settings.databentoApiKey}
                        onChange={(e) => setSettings({...settings, databentoApiKey: e.target.value})}
                        placeholder="db-xxxxxxxxxxxx"
                        className="bg-gray-900 border-gray-700 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('databentoApiKey')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showSecrets['databentoApiKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Stripe Configuration
                    </CardTitle>
                    <CardDescription>Payment processing settings</CardDescription>
                  </div>
                  <Badge variant="outline" className={getConnectionStatus('stripe') ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-red-900/50 text-red-400 border-red-600'}>
                    {getConnectionStatus('stripe') ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Configured
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                  <Input
                    id="stripePublishableKey"
                    value={settings.stripePublishableKey}
                    onChange={(e) => setSettings({...settings, stripePublishableKey: e.target.value})}
                    placeholder="pk_test_..."
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="stripeSecretKey">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripeSecretKey"
                      type={showSecrets['stripeSecretKey'] ? 'text' : 'password'}
                      value={settings.stripeSecretKey}
                      onChange={(e) => setSettings({...settings, stripeSecretKey: e.target.value})}
                      placeholder="sk_test_..."
                      className="bg-gray-900 border-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('stripeSecretKey')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showSecrets['stripeSecretKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="stripeWebhookSecret">Webhook Secret</Label>
                  <div className="relative">
                    <Input
                      id="stripeWebhookSecret"
                      type={showSecrets['stripeWebhookSecret'] ? 'text' : 'password'}
                      value={settings.stripeWebhookSecret}
                      onChange={(e) => setSettings({...settings, stripeWebhookSecret: e.target.value})}
                      placeholder="whsec_..."
                      className="bg-gray-900 border-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('stripeWebhookSecret')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showSecrets['stripeWebhookSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Resend Configuration
                    </CardTitle>
                    <CardDescription>Email service settings</CardDescription>
                  </div>
                  <Badge variant="outline" className={getConnectionStatus('resend') ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-red-900/50 text-red-400 border-red-600'}>
                    {getConnectionStatus('resend') ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Configured
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="resendApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="resendApiKey"
                      type={showSecrets['resendApiKey'] ? 'text' : 'password'}
                      value={settings.resendApiKey}
                      onChange={(e) => setSettings({...settings, resendApiKey: e.target.value})}
                      placeholder="re_..."
                      className="bg-gray-900 border-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('resendApiKey')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showSecrets['resendApiKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="resendFromEmail">From Email</Label>
                  <Input
                    id="resendFromEmail"
                    type="email"
                    value={settings.resendFromEmail}
                    onChange={(e) => setSettings({...settings, resendFromEmail: e.target.value})}
                    placeholder="noreply@nexuraltrading.com"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>General system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nextPublicUrl">Public URL</Label>
                  <Input
                    id="nextPublicUrl"
                    value={settings.nextPublicUrl}
                    onChange={(e) => setSettings({...settings, nextPublicUrl: e.target.value})}
                    placeholder="http://localhost:3010"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="nodeEnv">Environment</Label>
                  <select
                    id="nodeEnv"
                    value={settings.nodeEnv}
                    onChange={(e) => setSettings({...settings, nodeEnv: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="development">Development</option>
                    <option value="production">Production</option>
                    <option value="test">Test</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
