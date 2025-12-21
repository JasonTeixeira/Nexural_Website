'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Shield, Key, Copy, Check, AlertCircle, CheckCircle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import QRCode from 'qrcode'

interface TwoFactorData {
  id: string
  user_id: string
  enabled: boolean
  secret: string
  backup_codes: string[]
  created_at: string
}

export default function TwoFactorSetup() {
  const [twoFactor, setTwoFactor] = useState<TwoFactorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadTwoFactorData()
  }, [])

  async function loadTwoFactorData() {
    try {
      const supabase = createClient()
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/member-login')
        return
      }

      // Check if 2FA is already set up
      const { data: twoFactorData } = await supabase
        .from('two_factor_auth')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (twoFactorData) {
        setTwoFactor(twoFactorData)
        
        // Generate QR code if not enabled yet
        if (!twoFactorData.enabled) {
          await generateQRCode(twoFactorData.secret, user.email || '')
        }
      } else {
        // Initialize 2FA setup
        await initializeTwoFactor(user.id, user.email || '')
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading 2FA data:', error)
      setLoading(false)
    }
  }

  async function initializeTwoFactor(userId: string, email: string) {
    try {
      const response = await fetch('/api/member/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const data = await response.json()
        setTwoFactor(data.twoFactor)
        await generateQRCode(data.twoFactor.secret, email)
      }
    } catch (error) {
      console.error('Error initializing 2FA:', error)
    }
  }

  async function generateQRCode(secret: string, email: string) {
    try {
      const otpauthUrl = `otpauth://totp/Nexural Trading:${email}?secret=${secret}&issuer=Nexural Trading`
      const qrUrl = await QRCode.toDataURL(otpauthUrl)
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  async function verifyAndEnable() {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    try {
      setIsVerifying(true)
      setError(null)

      const response = await fetch('/api/member/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: twoFactor?.user_id,
          token: verificationCode
        })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setSuccess('2FA enabled successfully!')
        setShowBackupCodes(true)
        await loadTwoFactorData()
      } else {
        setError('Invalid verification code. Please try again.')
      }

      setIsVerifying(false)
    } catch (error) {
      setError('An error occurred. Please try again.')
      setIsVerifying(false)
    }
  }

  async function disable2FA() {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('two_factor_auth')
        .update({ enabled: false })
        .eq('id', twoFactor?.id)

      if (!error) {
        setSuccess('2FA disabled successfully')
        await loadTwoFactorData()
      }
    } catch (error) {
      setError('Failed to disable 2FA')
    }
  }

  function copySecret() {
    if (!twoFactor) return
    navigator.clipboard.writeText(twoFactor.secret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  function copyBackupCodes() {
    if (!twoFactor) return
    const codes = twoFactor.backup_codes.join('\n')
    navigator.clipboard.writeText(codes)
    setCopiedBackupCodes(true)
    setTimeout(() => setCopiedBackupCodes(false), 2000)
  }

  function downloadBackupCodes() {
    if (!twoFactor) return
    const codes = twoFactor.backup_codes.join('\n')
    const blob = new Blob([codes], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nexural-trading-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white text-lg">Loading 2FA settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/member-portal/account')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md mb-4"
          >
            ← Back to Account
          </button>
          <h1 className="text-4xl font-bold mb-2">🔐 Two-Factor Authentication</h1>
          <p className="text-gray-300">Add an extra layer of security to your account</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* 2FA Status */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white mb-1">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">
                  {twoFactor?.enabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                twoFactor?.enabled 
                  ? 'bg-green-900/30 text-green-400 border border-green-700' 
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
              }`}>
                {twoFactor?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions (if not enabled) */}
        {!twoFactor?.enabled && (
          <>
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Step 1: Scan QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                
                {qrCodeUrl && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-64 h-64" />
                    </div>
                    
                    <div className="w-full">
                      <p className="text-sm text-gray-400 mb-2">Or enter this code manually:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-3 font-mono text-sm text-gray-300">
                          {twoFactor?.secret}
                        </code>
                        <Button
                          onClick={copySecret}
                          variant="outline"
                          className="border-gray-600"
                        >
                          {copiedSecret ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Step 2: Verify Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Enter the 6-digit code from your authenticator app to enable 2FA
                </p>
                
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500"
                    maxLength={6}
                  />
                  <Button
                    onClick={verifyAndEnable}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    {isVerifying ? 'Verifying...' : 'Enable 2FA'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Backup Codes */}
        {twoFactor?.enabled && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-yellow-400" />
                Backup Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
              
              <div className="bg-gray-700 border border-gray-600 rounded-md p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {twoFactor.backup_codes.map((code, index) => (
                    <div key={index} className="text-gray-300">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={copyBackupCodes}
                  variant="outline"
                  className="border-gray-600"
                >
                  {copiedBackupCodes ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Codes
                    </>
                  )}
                </Button>
                <Button
                  onClick={downloadBackupCodes}
                  variant="outline"
                  className="border-gray-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disable 2FA */}
        {twoFactor?.enabled && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white mb-1">Disable Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400">
                    This will make your account less secure
                  </p>
                </div>
                <Button
                  onClick={disable2FA}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Disable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
