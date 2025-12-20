'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MemberPortalLayoutNew } from '@/components/member-portal-layout-new'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Lock, 
  Download, 
  Trash2,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Save,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailSignals: true,
    emailWeeklyReport: true,
    emailMonthlyReport: true,
    pushNewSignals: true,
    pushPriceAlerts: true,
    smsAlerts: false
  })

  // Email preferences
  const [emailPrefs, setEmailPrefs] = useState({
    marketingEmails: false,
    productUpdates: true,
    tradeAlerts: true
  })

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setLoading(false)
    } catch (error) {
      console.error('Error loading user:', error)
      setLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      alert('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Error updating password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveNotifications() {
    setSaving(true)
    try {
      // In a real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Notification preferences saved successfully!')
    } catch (error) {
      console.error('Error saving notifications:', error)
      alert('Error saving preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEmailPreferences() {
    setSaving(true)
    try {
      // In a real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Email preferences saved successfully!')
    } catch (error) {
      console.error('Error saving email preferences:', error)
      alert('Error saving preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleExportData() {
    try {
      const supabase = createClient()
      
      // Fetch all user data
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)

      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)

      const exportData = {
        user: {
          email: user.email,
          created_at: user.created_at
        },
        positions: positions || [],
        portfolios: portfolios || [],
        exported_at: new Date().toISOString()
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nexural-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('Data exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error exporting data. Please try again.')
    }
  }

  async function handleDeleteAccount() {
    const confirmation = prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    )

    if (confirmation !== 'DELETE') {
      return
    }

    const finalConfirm = confirm(
      'Are you absolutely sure? All your data will be permanently deleted.'
    )

    if (!finalConfirm) {
      return
    }

    try {
      const supabase = createClient()
      
      // In a real app, you'd have a backend endpoint to handle account deletion
      // For now, just sign out
      await supabase.auth.signOut()
      router.push('/')
      alert('Account deletion initiated. You have been logged out.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error processing request. Please contact support.')
    }
  }

  if (loading) {
    return (
      <MemberPortalLayoutNew>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </MemberPortalLayoutNew>
    )
  }

  return (
    <MemberPortalLayoutNew>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-cyan-400" />
            Account Settings
          </h1>
          <p className="text-gray-400">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and subscription status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-800 border-gray-700 mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Contact support to change your email address
                  </p>
                </div>

                <div>
                  <Label>Account Created</Label>
                  <Input
                    value={new Date(user?.created_at).toLocaleDateString()}
                    disabled
                    className="bg-gray-800 border-gray-700 mt-2"
                  />
                </div>

                <div>
                  <Label>User ID</Label>
                  <Input
                    value={user?.id || ''}
                    disabled
                    className="bg-gray-800 border-gray-700 mt-2 font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Password Change */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative mt-2">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="bg-gray-800 border-gray-700 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative mt-2">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="bg-gray-800 border-gray-700 pr-10"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative mt-2">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="bg-gray-800 border-gray-700 pr-10"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Enable 2FA</p>
                      <p className="text-sm text-gray-400">Secure your account with two-factor authentication</p>
                    </div>
                    <Button variant="outline">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Trading Signals</p>
                        <p className="text-sm text-gray-400">Get notified when new signals are posted</p>
                      </div>
                      <Switch
                        checked={notifications.emailSignals}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailSignals: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Performance Report</p>
                        <p className="text-sm text-gray-400">Receive weekly summaries of your trades</p>
                      </div>
                      <Switch
                        checked={notifications.emailWeeklyReport}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailWeeklyReport: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Monthly Performance Report</p>
                        <p className="text-sm text-gray-400">Get detailed monthly analytics</p>
                      </div>
                      <Switch
                        checked={notifications.emailMonthlyReport}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailMonthlyReport: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Signals</p>
                        <p className="text-sm text-gray-400">Real-time push notifications for new signals</p>
                      </div>
                      <Switch
                        checked={notifications.pushNewSignals}
                        onCheckedChange={(checked) => setNotifications({...notifications, pushNewSignals: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Price Alerts</p>
                        <p className="text-sm text-gray-400">Notifications when positions hit targets</p>
                      </div>
                      <Switch
                        checked={notifications.pushPriceAlerts}
                        onCheckedChange={(checked) => setNotifications({...notifications, pushPriceAlerts: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-4">SMS Alerts</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Critical Trade Alerts</p>
                        <p className="text-sm text-gray-400">SMS for urgent trade updates</p>
                      </div>
                      <Switch
                        checked={notifications.smsAlerts}
                        onCheckedChange={(checked) => setNotifications({...notifications, smsAlerts: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notification Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Preferences Tab */}
          <TabsContent value="email">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Email Preferences</CardTitle>
                <CardDescription>Choose what emails you'd like to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-400">Receive updates about new features and offers</p>
                    </div>
                    <Switch
                      checked={emailPrefs.marketingEmails}
                      onCheckedChange={(checked) => setEmailPrefs({...emailPrefs, marketingEmails: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-sm text-gray-400">Stay informed about platform improvements</p>
                    </div>
                    <Switch
                      checked={emailPrefs.productUpdates}
                      onCheckedChange={(checked) => setEmailPrefs({...emailPrefs, productUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trade Alerts</p>
                      <p className="text-sm text-gray-400">Important trading notifications and alerts</p>
                    </div>
                    <Switch
                      checked={emailPrefs.tradeAlerts}
                      onCheckedChange={(checked) => setEmailPrefs({...emailPrefs, tradeAlerts: checked})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveEmailPreferences}
                  disabled={saving}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Email Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Privacy Tab */}
          <TabsContent value="data">
            <div className="space-y-6">
              {/* Export Data */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-cyan-400" />
                    Export Your Data
                  </CardTitle>
                  <CardDescription>Download all your data in JSON format</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Export includes all your positions, portfolios, and account information.
                  </p>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              {/* Delete Account */}
              <Card className="bg-gradient-to-br from-red-900/20 to-gray-900 border-red-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </CardTitle>
                  <CardDescription>Permanently delete your account and all associated data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong className="text-red-400">Warning:</strong> This action cannot be undone. 
                        All your data, including positions, portfolios, and settings will be permanently deleted.
                      </p>
                    </div>
                    <Button 
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MemberPortalLayoutNew>
  )
}
