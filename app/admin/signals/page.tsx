'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminAuthenticated, getAdminUser, AdminUser } from '@/lib/admin-auth'

interface Signal {
  signal_id: string
  symbol: string
  direction: string
  entry_price: number
  stop_loss: number
  target1_price?: number
  target2_price?: number
  target3_price?: number
  confidence: number
  strategy: string
  timeframe: string
  status: string
  signal_time: string
  notes?: string
  risk_reward_ratio?: number
  position_size: number
}

interface SignalTemplate {
  name: string
  direction: string
  confidence: number
  strategy: string
  timeframe: string
  riskReward: number
  description: string
}

interface SignalForm {
  symbol: string
  direction: string
  entry: string
  stop_loss: string
  target1: string
  target2: string
  target3: string
  confidence: number
  strategy: string
  timeframe: string
  notes: string
  riskReward: number
  positionSize: number
  sendToDiscord: boolean
  executeOnSim: boolean
}

const SYMBOLS = [
  { value: 'ES', name: 'E-mini S&P 500', category: 'Indices' },
  { value: 'NQ', name: 'E-mini NASDAQ', category: 'Indices' },
  { value: 'YM', name: 'E-mini Dow', category: 'Indices' },
  { value: 'RTY', name: 'E-mini Russell', category: 'Indices' },
  { value: 'BTC', name: 'Bitcoin', category: 'Crypto' },
  { value: 'ETH', name: 'Ethereum', category: 'Crypto' },
  { value: 'CL', name: 'Crude Oil', category: 'Energy' },
  { value: 'GC', name: 'Gold', category: 'Metals' },
  { value: 'SI', name: 'Silver', category: 'Metals' },
  { value: 'ZN', name: '10-Year Treasury', category: 'Bonds' },
  { value: 'EUR', name: 'Euro', category: 'Forex' },
  { value: 'JPY', name: 'Japanese Yen', category: 'Forex' },
  { value: 'NG', name: 'Natural Gas', category: 'Energy' },
  { value: 'HG', name: 'Copper', category: 'Metals' },
  { value: 'ZC', name: 'Corn', category: 'Agriculture' },
  { value: 'ZS', name: 'Soybeans', category: 'Agriculture' },
  { value: 'ZW', name: 'Wheat', category: 'Agriculture' }
]

export default function AdminSignalsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const router = useRouter()

  // Signal generation state
  const [signalForm, setSignalForm] = useState<SignalForm>({
    symbol: 'ES',
    direction: 'LONG',
    entry: '',
    stop_loss: '',
    target1: '',
    target2: '',
    target3: '',
    confidence: 85,
    strategy: 'Manual Entry',
    timeframe: '15m',
    notes: '',
    riskReward: 2.0,
    positionSize: 1,
    sendToDiscord: true,
    executeOnSim: true
  })

  // UI state
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'templates'>('generate')
  const [isGenerating, setIsGenerating] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [recentSignals, setRecentSignals] = useState<Signal[]>([])
  const [templates, setTemplates] = useState<Record<string, SignalTemplate>>({})
  const [stats, setStats] = useState({ total: 0, today: 0, active: 0 })
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      if (isAdminAuthenticated()) {
        const user = getAdminUser()
        setAdminUser(user)
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadSignalData()
      // Refresh every 30 seconds
      const interval = setInterval(loadSignalData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadSignalData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      
      // Load recent signals with auth
      const signalsResponse = await fetch('/api/admin/signals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (signalsResponse.ok) {
        const signalsData = await signalsResponse.json()
        setRecentSignals(signalsData.signals || [])
        setTemplates(signalsData.templates || {})
        
        // Calculate stats from signals
        const signals = signalsData.signals || []
        setStats({
          total: signals.length,
          today: signals.filter((s: any) => {
            const today = new Date().toDateString()
            return new Date(s.created_at).toDateString() === today
          }).length,
          active: signals.filter((s: any) => s.status === 'ACTIVE').length
        })
      }
    } catch (error) {
      console.error('Error loading signal data:', error)
    }
  }

  const handleFormChange = (field: keyof SignalForm, value: any) => {
    setSignalForm(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate preview when key fields change
    if (['symbol', 'direction', 'entry', 'stop_loss', 'target1'].includes(field)) {
      generatePreview({ ...signalForm, [field]: value })
    }
  }

  const generatePreview = async (formData: SignalForm = signalForm) => {
    if (!formData.symbol || !formData.entry || !formData.stop_loss) return

    try {
      const response = await fetch('/api/admin/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          signal: formData
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPreview(data.preview)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  const applyTemplate = async (templateKey: string) => {
    try {
      const response = await fetch('/api/admin/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'template',
          template: templateKey
        })
      })

      if (response.ok) {
        const data = await response.json()
        const template = data.template
        
        setSignalForm(prev => ({
          ...prev,
          direction: template.direction,
          confidence: template.confidence,
          strategy: template.strategy,
          timeframe: template.timeframe,
          riskReward: template.riskReward
        }))
        
        setSelectedTemplate(templateKey)
      }
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  const generateSignal = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/admin/signal-generator', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-signal',
          symbol: signalForm.symbol,
          signal: signalForm
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Show success message
        alert(`Signal generated successfully!\nSignal ID: ${data.signalId}\nDiscord: ${data.discord ? 'Sent' : 'Skipped'}\nSim Accounts: ${data.simAccounts ? 'Executed' : 'Skipped'}`)
        
        // Reset form
        setSignalForm(prev => ({
          ...prev,
          entry: '',
          stop_loss: '',
          target1: '',
          target2: '',
          target3: '',
          notes: ''
        }))
        
        // Reload data
        loadSignalData()
        setPreview(null)
      } else {
        const errorData = await response.json()
        alert(`Error generating signal: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error generating signal:', error)
      alert('Error generating signal. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-white text-lg">Loading signal generator...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎯 Signal Generator</h1>
              <p className="text-gray-300">Professional trading signal creation and management</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Signals</p>
                <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Signals</p>
                <p className="text-3xl font-bold text-green-400">{stats.today}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Signals</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.active}</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { key: 'generate', label: '🚀 Generate Signal', icon: '🚀' },
              { key: 'history', label: '📋 Signal History', icon: '📋' },
              { key: 'templates', label: '📝 Templates', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Signal Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Signal Form */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-blue-400">📝 Signal Details</h2>
              
              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-300">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className={`p-3 rounded-md text-sm font-medium transition-colors ${
                        selectedTemplate === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Signal Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Symbol</label>
                    <select
                      value={signalForm.symbol}
                      onChange={(e) => handleFormChange('symbol', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {SYMBOLS.map((symbol) => (
                        <option key={symbol.value} value={symbol.value}>
                          {symbol.value} - {symbol.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Direction</label>
                    <select
                      value={signalForm.direction}
                      onChange={(e) => handleFormChange('direction', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="LONG">🟢 LONG</option>
                      <option value="SHORT">🔴 SHORT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Entry Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.entry}
                      onChange={(e) => handleFormChange('entry', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="4500.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Stop Loss *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.stop_loss}
                      onChange={(e) => handleFormChange('stop_loss', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="4480.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Target 1</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.target1}
                      onChange={(e) => handleFormChange('target1', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="4520.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Target 2</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.target2}
                      onChange={(e) => handleFormChange('target2', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="4540.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Target 3</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.target3}
                      onChange={(e) => handleFormChange('target3', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="4560.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Confidence: {signalForm.confidence}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={signalForm.confidence}
                      onChange={(e) => handleFormChange('confidence', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Position Size</label>
                    <input
                      type="number"
                      min="1"
                      value={signalForm.positionSize}
                      onChange={(e) => handleFormChange('positionSize', parseInt(e.target.value))}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Strategy</label>
                    <input
                      type="text"
                      value={signalForm.strategy}
                      onChange={(e) => handleFormChange('strategy', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Manual Entry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Timeframe</label>
                    <select
                      value={signalForm.timeframe}
                      onChange={(e) => handleFormChange('timeframe', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="1m">1 Minute</option>
                      <option value="5m">5 Minutes</option>
                      <option value="15m">15 Minutes</option>
                      <option value="30m">30 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="4h">4 Hours</option>
                      <option value="1d">Daily</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Notes (Optional)</label>
                  <textarea
                    value={signalForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Additional notes about this signal..."
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={signalForm.sendToDiscord}
                      onChange={(e) => handleFormChange('sendToDiscord', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Send to Discord</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={signalForm.executeOnSim}
                      onChange={(e) => handleFormChange('executeOnSim', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Execute on Sim Accounts</span>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateSignal}
                  disabled={isGenerating || !signalForm.symbol || !signalForm.entry || !signalForm.stop_loss}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-md transition-colors duration-200"
                >
                  {isGenerating ? '🔄 Generating Signal...' : '🚀 Generate Signal'}
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-green-400">👁️ Signal Preview</h2>
              
              {preview ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        preview.direction === 'LONG' 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {preview.symbol} {preview.direction}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        preview.confidence >= 85 
                          ? 'bg-green-600 text-green-100' 
                          : preview.confidence >= 75 
                          ? 'bg-yellow-600 text-yellow-100'
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {preview.confidence}% CONF
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Entry:</span>
                        <span className="ml-2 font-semibold text-white">${preview.entry}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Stop Loss:</span>
                        <span className="ml-2 font-semibold text-red-400">${preview.stopLoss}</span>
                      </div>
                      {preview.targets.map((target: number, index: number) => (
                        <div key={index}>
                          <span className="text-gray-400">Target {index + 1}:</span>
                          <span className="ml-2 font-semibold text-green-400">${target}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">📊 Risk Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Estimated Risk:</span>
                        <span className="ml-2 font-semibold text-red-400">${preview.estimatedRisk.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Estimated Reward:</span>
                        <span className="ml-2 font-semibold text-green-400">${preview.estimatedReward.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Risk/Reward:</span>
                        <span className="ml-2 font-semibold text-blue-400">
                          1:{preview.estimatedRisk > 0 ? (preview.estimatedReward / preview.estimatedRisk).toFixed(2) : '0'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Position Size:</span>
                        <span className="ml-2 font-semibold text-white">{preview.positionSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">⚙️ Execution Plan</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Discord Notification:</span>
                        <span className={`font-semibold ${signalForm.sendToDiscord ? 'text-green-400' : 'text-red-400'}`}>
                          {signalForm.sendToDiscord ? '✅ Enabled' : '❌ Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Sim Account Execution:</span>
                        <span className={`font-semibold ${signalForm.executeOnSim ? 'text-green-400' : 'text-red-400'}`}>
                          {signalForm.executeOnSim ? '✅ Enabled' : '❌ Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Strategy:</span>
                        <span className="font-semibold text-white">{preview.strategy}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Timeframe:</span>
                        <span className="font-semibold text-white">{preview.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">👁️</div>
                  <p className="text-lg">Enter signal details to see preview</p>
                  <p className="text-sm">Fill in Symbol, Entry, and Stop Loss to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signal History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-purple-400">📋 Recent Signals</h2>
            
            <div className="space-y-4">
              {recentSignals.map((signal) => (
                <div key={signal.signal_id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        signal.direction === 'LONG' 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {signal.symbol} {signal.direction}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        signal.status === 'ACTIVE' 
                          ? 'bg-yellow-600 text-yellow-100' 
                          : signal.status === 'CLOSED'
                          ? 'bg-green-600 text-green-100'
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {signal.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        signal.confidence >= 85 
                          ? 'bg-green-600 text-green-100' 
                          : signal.confidence >= 75 
                          ? 'bg-yellow-600 text-yellow-100'
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {signal.confidence}% CONF
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(signal.signal_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="font-medium">Entry:</span> ${signal.entry_price}
                      </div>
                      <div>
                        <span className="font-medium">Stop:</span> ${signal.stop_loss}
                      </div>
                      <div>
                        <span className="font-medium">Target 1:</span> {signal.target1_price ? `$${signal.target1_price}` : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Strategy:</span> {signal.strategy}
                      </div>
                    </div>
                    {signal.notes && (
                      <div className="mt-2 text-xs text-gray-400">
                        <span className="font-medium">Notes:</span> {signal.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {recentSignals.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg">No signals found</p>
                  <p className="text-sm">Generated signals will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-yellow-400">📝 Signal Templates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(templates).map(([key, template]) => (
                <div key={key} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.direction === 'LONG' 
                        ? 'bg-green-600 text-green-100' 
                        : 'bg-red-600 text-red-100'
                    }`}>
                      {template.direction}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4">{template.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-white font-medium">{template.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strategy:</span>
                      <span className="text-white font-medium">{template.strategy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timeframe:</span>
                      <span className="text-white font-medium">{template.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk/Reward:</span>
                      <span className="text-white font-medium">1:{template.riskReward}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      applyTemplate(key)
                      setActiveTab('generate')
                    }}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
