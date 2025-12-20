'use client'

import { Button } from '@/components/ui/button'
import { Activity, Mail, Users, TrendingUp, Database, Target, Brain, DollarSign, HardDrive } from 'lucide-react'
import { DashboardWidget } from './dashboard-widget'
import { useRouter } from 'next/navigation'

// ============================================================================
// IB GATEWAY WIDGET
// ============================================================================

interface IBGatewayWidgetProps {
  data: any
  onConnect: () => void
  onDisconnect: () => void
  onHealthCheck: () => void
}

export function IBGatewayWidget({ data, onConnect, onDisconnect, onHealthCheck }: IBGatewayWidgetProps) {
  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  const status = data?.isConnected ? 'connected' : 'disconnected'
  const statusText = data?.isConnected ? 'Connected' : 'Disconnected'

  const stats = [
    {
      label: 'Positions',
      value: data?.positions || 0,
      subtext: `${data?.orders || 0} orders`
    },
    {
      label: 'Account Balance',
      value: data?.accountBalance ? `$${data.accountBalance.toLocaleString()}` : '$0',
      subtext: 'Net liquidation'
    },
    {
      label: 'Uptime',
      value: data?.uptime ? formatUptime(data.uptime) : '0h 0m',
      subtext: data?.reconnectAttempts > 0 ? `${data.reconnectAttempts} reconnects` : 'Stable'
    }
  ]

  const actions = (
    <>
      {data?.isConnected ? (
        <>
          <Button size="sm" variant="outline" onClick={onDisconnect} className="border-red-600 text-red-400 hover:bg-red-900/50">
            Disconnect
          </Button>
          <Button size="sm" variant="outline" onClick={onHealthCheck} className="border-gray-600">
            Health Check
          </Button>
        </>
      ) : (
        <Button size="sm" onClick={onConnect} className="bg-green-600 hover:bg-green-700">
          Connect
        </Button>
      )}
    </>
  )

  return (
    <DashboardWidget
      title="IB Gateway"
      icon={<Activity className="h-5 w-5 text-blue-400" />}
      status={status}
      statusText={statusText}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        {/* Recent Events */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Events</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {data?.recentEvents && data.recentEvents.length > 0 ? (
              data.recentEvents.map((event: any, index: number) => (
                <div key={index} className="text-xs text-gray-400 flex items-center justify-between py-1 border-b border-gray-700">
                  <span>{event.message}</span>
                  <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent events</p>
            )}
          </div>
        </div>

        {/* Top Positions */}
        {data?.positionsList && data.positionsList.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Top Positions</h4>
            <div className="space-y-1">
              {data.positionsList.map((position: any, index: number) => (
                <div key={index} className="text-xs text-gray-400 flex items-center justify-between py-1">
                  <span>{position.contract?.symbol || 'Unknown'}</span>
                  <span>{position.position} @ ${position.averageCost?.toFixed(2) || '0.00'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// DISCORD SIGNALS WIDGET
// ============================================================================

interface DiscordSignalsWidgetProps {
  data: any
  onSendSignal: () => void
  onViewHistory: () => void
}

export function DiscordSignalsWidget({ data, onSendSignal, onViewHistory }: DiscordSignalsWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'Active Channels',
      value: data?.activeChannels || 21,
      subtext: '18 futures + 3 special'
    },
    {
      label: 'Signals Today',
      value: data?.signalsToday || 0,
      subtext: `${data?.totalSignals || 0} total`
    },
    {
      label: 'Last Signal',
      value: data?.lastSignalTime ? new Date(data.lastSignalTime).toLocaleTimeString() : 'None',
      subtext: 'Recent activity'
    }
  ]

  const actions = (
    <>
      <Button size="sm" onClick={onSendSignal} className="bg-blue-600 hover:bg-blue-700">
        Send Signal
      </Button>
      <Button size="sm" variant="outline" onClick={onViewHistory} className="border-gray-600">
        View History
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="Discord Signals"
      icon={<Target className="h-5 w-5 text-yellow-400" />}
      status="connected"
      statusText={`${data?.activeChannels || 21} channels active`}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Signals</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data?.recentSignals && data.recentSignals.length > 0 ? (
              data.recentSignals.map((signal: any, index: number) => (
                <div key={index} className="text-xs bg-gray-700/50 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{signal.symbol}</span>
                    <span className={signal.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                      {signal.direction}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    Entry: ${signal.entry_price} | Target: ${signal.target_price}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {new Date(signal.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent signals</p>
            )}
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// NEWSLETTER WIDGET
// ============================================================================

interface NewsletterWidgetProps {
  data: any
  onSendCampaign: () => void
  onManage: () => void
}

export function NewsletterWidget({ data, onSendCampaign, onManage }: NewsletterWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'Subscribers',
      value: data?.totalSubscribers || 0,
      subtext: 'Active subscribers'
    },
    {
      label: 'Open Rate',
      value: `${data?.openRate || 0}%`,
      subtext: 'Last 5 campaigns'
    },
    {
      label: 'Campaigns',
      value: data?.campaignsThisMonth || 0,
      subtext: 'This month'
    }
  ]

  const actions = (
    <>
      <Button size="sm" onClick={onSendCampaign} className="bg-cyan-600 hover:bg-cyan-700">
        Send Campaign
      </Button>
      <Button size="sm" variant="outline" onClick={onManage} className="border-gray-600">
        Manage
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="Newsletter"
      icon={<Mail className="h-5 w-5 text-cyan-400" />}
      status="connected"
      statusText={`${data?.totalSubscribers || 0} subscribers`}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Campaigns</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data?.recentCampaigns && data.recentCampaigns.length > 0 ? (
              data.recentCampaigns.map((campaign: any, index: number) => (
                <div key={index} className="text-xs bg-gray-700/50 rounded p-2">
                  <div className="font-medium text-white mb-1">{campaign.subject}</div>
                  <div className="text-gray-400">
                    Sent: {campaign.sent_count} | Opens: {campaign.opens || 0}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {new Date(campaign.sent_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent campaigns</p>
            )}
          </div>
        </div>

        {data?.nextScheduled && (
          <div className="bg-blue-900/20 border border-blue-700 rounded p-2">
            <p className="text-xs text-blue-400">
              Next scheduled: {new Date(data.nextScheduled.scheduled_for).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// MEMBER MANAGEMENT WIDGET
// ============================================================================

interface MemberManagementWidgetProps {
  data: any
  onAddMember: () => void
  onViewAll: () => void
}

export function MemberManagementWidget({ data, onAddMember, onViewAll }: MemberManagementWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'Total Members',
      value: data?.total || 0,
      subtext: `${data?.active || 0} active`
    },
    {
      label: 'New Today',
      value: data?.newToday || 0,
      subtext: 'Last 24 hours'
    },
    {
      label: 'Churn Rate',
      value: `${data?.churnRate || 0}%`,
      subtext: 'Last 30 days'
    }
  ]

  const actions = (
    <>
      <Button size="sm" onClick={onAddMember} className="bg-green-600 hover:bg-green-700">
        Add Member
      </Button>
      <Button size="sm" variant="outline" onClick={onViewAll} className="border-gray-600">
        View All
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="Member Management"
      icon={<Users className="h-5 w-5 text-green-400" />}
      status="connected"
      statusText={`${data?.total || 0} members`}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Members</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data?.recent && data.recent.length > 0 ? (
              data.recent.map((member: any, index: number) => (
                <div key={index} className="text-xs bg-gray-700/50 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{member.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      member.subscription_status === 'active' 
                        ? 'bg-green-900/50 text-green-400' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {member.subscription_status || 'inactive'}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Joined: {new Date(member.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent members</p>
            )}
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// PAPER TRADING WIDGET
// ============================================================================

interface PaperTradingWidgetProps {
  data: any
  onConfigure: () => void
  onViewResults: () => void
}

export function PaperTradingWidget({ data, onConfigure, onViewResults }: PaperTradingWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'Active Strategies',
      value: data?.activeStrategies || 0,
      subtext: data?.isEnabled ? 'Enabled' : 'Disabled'
    },
    {
      label: 'P&L Today',
      value: data?.pnlToday ? `$${data.pnlToday.toLocaleString()}` : '$0',
      subtext: data?.pnlToday >= 0 ? 'Profit' : 'Loss'
    },
    {
      label: 'Win Rate',
      value: `${data?.winRate || 0}%`,
      subtext: `${data?.totalTrades || 0} trades`
    }
  ]

  const status = data?.isEnabled ? 'connected' : 'disconnected'
  const statusText = data?.isEnabled ? 'Enabled' : 'Disabled'

  const actions = (
    <>
      <Button size="sm" onClick={onConfigure} className="bg-purple-600 hover:bg-purple-700">
        Configure
      </Button>
      <Button size="sm" variant="outline" onClick={onViewResults} className="border-gray-600">
        View Results
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="Paper Trading"
      icon={<TrendingUp className="h-5 w-5 text-purple-400" />}
      status={status}
      statusText={statusText}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Active Strategies</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data?.strategies && data.strategies.length > 0 ? (
              data.strategies.map((strategy: any, index: number) => (
                <div key={index} className="text-xs bg-gray-700/50 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{strategy.name}</span>
                    <span className="text-green-400">{strategy.enabled ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="text-gray-400">
                    Symbols: {strategy.symbols?.join(', ') || 'All'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No active strategies</p>
            )}
          </div>
        </div>

        {data?.pnlToday !== 0 && (
          <div className={`rounded p-2 ${
            data.pnlToday >= 0 
              ? 'bg-green-900/20 border border-green-700' 
              : 'bg-red-900/20 border border-red-700'
          }`}>
            <p className={`text-xs ${data.pnlToday >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Today's P&L: ${data.pnlToday.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// MARKET DATA WIDGET
// ============================================================================

interface MarketDataWidgetProps {
  data: any
  onViewLiveData: () => void
  onExport: () => void
}

export function MarketDataWidget({ data, onViewLiveData, onExport }: MarketDataWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'Symbols',
      value: data?.symbols || 18,
      subtext: 'Futures monitored'
    },
    {
      label: 'Data Points',
      value: data?.dataPointsToday ? data.dataPointsToday.toLocaleString() : '0',
      subtext: 'Today'
    },
    {
      label: 'Provider',
      value: data?.provider || 'Databento',
      subtext: data?.isConnected ? 'Connected' : 'Disconnected'
    }
  ]

  const status = data?.isConnected ? 'connected' : 'disconnected'
  const statusText = data?.isConnected ? 'Connected' : 'Disconnected'

  const actions = (
    <>
      <Button size="sm" onClick={onViewLiveData} className="bg-indigo-600 hover:bg-indigo-700">
        Live Data
      </Button>
      <Button size="sm" variant="outline" onClick={onExport} className="border-gray-600">
        Export
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="Market Data"
      icon={<Database className="h-5 w-5 text-indigo-400" />}
      status={status}
      statusText={statusText}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Monitored Symbols</h4>
          <div className="flex flex-wrap gap-1">
            {data?.symbolsList && data.symbolsList.length > 0 ? (
              data.symbolsList.map((symbol: string, index: number) => (
                <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {symbol}
                </span>
              ))
            ) : (
              <p className="text-xs text-gray-500">No symbols</p>
            )}
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 rounded p-2">
          <p className="text-xs text-blue-400">
            Real-time data streaming via {data?.provider || 'Databento'}
          </p>
        </div>
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// ML MONITORING WIDGET
// ============================================================================

interface MLMonitoringWidgetProps {
  data: any
  onRetrain: () => void
  onViewModels: () => void
}

export function MLMonitoringWidget({ data, onRetrain, onViewModels }: MLMonitoringWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'Active Models',
      value: data?.activeModels || 0,
      subtext: data?.totalModels ? `${data.totalModels} total` : 'No models'
    },
    {
      label: 'Accuracy',
      value: data?.accuracy ? `${data.accuracy}%` : 'N/A',
      subtext: data?.lastTrained ? 'Last trained' : 'Not trained'
    },
    {
      label: 'Training Status',
      value: data?.trainingStatus || 'Idle',
      subtext: data?.queueSize ? `${data.queueSize} in queue` : 'No queue'
    }
  ]

  const status = data?.isTraining ? 'warning' : data?.activeModels > 0 ? 'connected' : 'disconnected'
  const statusText = data?.isTraining ? 'Training' : data?.activeModels > 0 ? 'Active' : 'Idle'

  const actions = (
    <>
      <Button size="sm" onClick={onRetrain} className="bg-purple-600 hover:bg-purple-700" disabled={data?.isTraining}>
        {data?.isTraining ? 'Training...' : 'Retrain'}
      </Button>
      <Button size="sm" variant="outline" onClick={onViewModels} className="border-gray-600">
        View Models
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="ML Monitoring"
      icon={<Brain className="h-5 w-5 text-purple-400" />}
      status={status}
      statusText={statusText}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Models</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data?.recentModels && data.recentModels.length > 0 ? (
              data.recentModels.map((model: any, index: number) => (
                <div key={index} className="text-xs bg-gray-700/50 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{model.name}</span>
                    <span className="text-green-400">{model.accuracy}%</span>
                  </div>
                  <div className="text-gray-400">
                    Version: {model.version} | Trained: {new Date(model.trained_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No models trained yet</p>
            )}
          </div>
        </div>

        {data?.isTraining && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded p-2">
            <p className="text-xs text-yellow-400">
              Training in progress... {data.trainingProgress}%
            </p>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// REVENUE WIDGET
// ============================================================================

interface RevenueWidgetProps {
  data: any
  onViewPayments: () => void
  onViewSubscriptions: () => void
}

export function RevenueWidget({ data, onViewPayments, onViewSubscriptions }: RevenueWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'MRR',
      value: data?.mrr ? `$${data.mrr.toLocaleString()}` : '$0',
      subtext: 'Monthly Recurring'
    },
    {
      label: 'Today',
      value: data?.todayRevenue ? `$${data.todayRevenue.toLocaleString()}` : '$0',
      subtext: data?.todayPayments ? `${data.todayPayments} payments` : '0 payments'
    },
    {
      label: 'Failed',
      value: data?.failedPayments || 0,
      subtext: 'This month'
    }
  ]

  const status = data?.failedPayments > 0 ? 'warning' : 'connected'
  const statusText = data?.failedPayments > 0 ? `${data.failedPayments} failed` : 'All good'

  const actions = (
    <>
      <Button size="sm" onClick={onViewPayments} className="bg-green-600 hover:bg-green-700">
        Payments
      </Button>
      <Button size="sm" variant="outline" onClick={onViewSubscriptions} className="border-gray-600">
        Subscriptions
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="Revenue & Payments"
      icon={<DollarSign className="h-5 w-5 text-green-400" />}
      status={status}
      statusText={statusText}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Subscription Breakdown</h4>
          <div className="space-y-2">
            {data?.subscriptionBreakdown && data.subscriptionBreakdown.length > 0 ? (
              data.subscriptionBreakdown.map((sub: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{sub.plan}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{sub.count} members</span>
                    <span className="text-green-400">${sub.revenue.toLocaleString()}/mo</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No active subscriptions</p>
            )}
          </div>
        </div>

        {data?.failedPayments > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded p-2">
            <p className="text-xs text-red-400">
              {data.failedPayments} failed payment{data.failedPayments > 1 ? 's' : ''} need attention
            </p>
          </div>
        )}

        <div className="bg-green-900/20 border border-green-700 rounded p-2">
          <p className="text-xs text-green-400">
            Total Revenue: ${data?.totalRevenue?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
    </DashboardWidget>
  )
}

// ============================================================================
// DATABASE METRICS WIDGET
// ============================================================================

interface DatabaseMetricsWidgetProps {
  data: any
  onViewBackups: () => void
  onRunBackup: () => void
}

export function DatabaseMetricsWidget({ data, onViewBackups, onRunBackup }: DatabaseMetricsWidgetProps) {
  const router = useRouter()

  const stats = [
    {
      label: 'Database Size',
      value: data?.size || 'N/A',
      subtext: data?.tables ? `${data.tables} tables` : 'Unknown'
    },
    {
      label: 'Queries/sec',
      value: data?.queriesPerSecond || 0,
      subtext: data?.avgQueryTime ? `${data.avgQueryTime}ms avg` : 'N/A'
    },
    {
      label: 'Last Backup',
      value: data?.lastBackup ? new Date(data.lastBackup).toLocaleDateString() : 'Never',
      subtext: data?.backupSize || 'No backup'
    }
  ]

  const status = data?.isHealthy ? 'connected' : 'error'
  const statusText = data?.isHealthy ? 'Healthy' : 'Issues detected'

  const actions = (
    <>
      <Button size="sm" onClick={onRunBackup} className="bg-blue-600 hover:bg-blue-700">
        Backup Now
      </Button>
      <Button size="sm" variant="outline" onClick={onViewBackups} className="border-gray-600">
        View Backups
      </Button>
    </>
  )

  return (
    <DashboardWidget
      title="Database Metrics"
      icon={<HardDrive className="h-5 w-5 text-blue-400" />}
      status={status}
      statusText={statusText}
      stats={stats}
      actions={actions}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Connection Pool</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Active Connections</span>
              <span className="text-white">{data?.activeConnections || 0} / {data?.maxConnections || 100}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${data?.connectionUsage || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Backups</h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {data?.recentBackups && data.recentBackups.length > 0 ? (
              data.recentBackups.map((backup: any, index: number) => (
                <div key={index} className="text-xs text-gray-400 flex items-center justify-between py-1">
                  <span>{new Date(backup.created_at).toLocaleString()}</span>
                  <span className="text-gray-500">{backup.size}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent backups</p>
            )}
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 rounded p-2">
          <p className="text-xs text-blue-400">
            Auto-backup: {data?.autoBackupEnabled ? 'Enabled (Daily)' : 'Disabled'}
          </p>
        </div>
      </div>
    </DashboardWidget>
  )
}
