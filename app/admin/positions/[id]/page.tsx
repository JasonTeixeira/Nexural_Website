import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, TrendingUp, TrendingDown, Target as TargetIcon, Shield, Activity as ActivityIcon, X } from 'lucide-react'
import { StopLossManager } from '@/components/positions/stop-loss-manager'
import { TargetManager } from '@/components/positions/target-manager'
import { ActivityTimeline } from '@/components/positions/activity-timeline'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PositionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  // Auth temporarily disabled for development
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/login')
  // }

  // Fetch position
  const { data: position, error } = await supabase
    .from('positions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !position) {
    notFound()
  }

  // Fetch targets
  const { data: targets } = await supabase
    .from('position_targets')
    .select('*')
    .eq('position_id', id)
    .order('target_number')

  // Fetch stop loss history
  const { data: stopHistory } = await supabase
    .from('stop_loss_history')
    .select('*')
    .eq('position_id', id)
    .order('moved_at', { ascending: false })

  // Fetch activity
  const { data: activity } = await supabase
    .from('position_activity')
    .select('*')
    .eq('position_id', id)
    .order('timestamp', { ascending: false })

  const isOpen = position.status === 'open'
  const pnl = isOpen ? position.unrealized_pnl : position.realized_pnl
  const pnlPct = isOpen ? position.unrealized_pnl_pct : position.realized_pnl_pct
  const isProfitable = (pnl || 0) >= 0

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/positions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Positions
          </Button>
        </Link>
      </div>

      {/* Position Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{position.ticker}</h1>
              <Badge variant={isOpen ? 'default' : 'secondary'}>
                {position.status}
              </Badge>
              <Badge variant="outline">{position.time_frame}</Badge>
              {position.setup_type && (
                <Badge>{position.setup_type}</Badge>
              )}
            </div>
            <p className="text-xl text-muted-foreground">{position.company_name}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitable ? '+' : ''}${pnl?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-lg ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitable ? '+' : ''}{pnlPct?.toFixed(2) || '0.00'}%
            </div>
            {isOpen && <p className="text-sm text-muted-foreground mt-1">Unrealized</p>}
          </div>
        </div>

        {/* Tags */}
        {position.tags && position.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {position.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${position.entry_price?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {position.shares} shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isOpen ? 'Current' : 'Exit'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(isOpen ? position.current_price : position.exit_price)?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOpen && position.last_price_update && 
                `Updated ${new Date(position.last_price_update).toLocaleTimeString()}`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stop Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${position.stop_loss?.toFixed(2)}</div>
            {stopHistory && stopHistory.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Moved {stopHistory.length} time{stopHistory.length > 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${position.risk_dollars?.toFixed(0) || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {position.risk_percent?.toFixed(1) || '0'}% of portfolio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* TODO: Re-enable after implementing proper modal state management
      {isOpen && (
        <div className="flex gap-4 mb-8">
          <StopLossManager position={position} isOpen={false} onClose={() => {}} onSuccess={() => {}} />
          <TargetManager position={position} />
          <Button variant="destructive">
            <X className="w-4 h-4 mr-2" />
            Close Position
          </Button>
        </div>
      )}
      */}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entry Thesis */}
            <Card>
              <CardHeader>
                <CardTitle>Entry Thesis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {position.entry_thesis || 'No thesis provided'}
                </p>
              </CardContent>
            </Card>

            {/* Position Details */}
            <Card>
              <CardHeader>
                <CardTitle>Position Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{position.position_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direction:</span>
                  <span className="font-medium">{position.direction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Date:</span>
                  <span className="font-medium">
                    {new Date(position.entry_date).toLocaleDateString()}
                  </span>
                </div>
                {!isOpen && position.exit_date && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exit Date:</span>
                      <span className="font-medium">
                        {new Date(position.exit_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hold Days:</span>
                      <span className="font-medium">{position.actual_hold_days || 'N/A'}</span>
                    </div>
                  </>
                )}
                {position.actual_r_multiple && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">R-Multiple:</span>
                    <span className="font-medium">{position.actual_r_multiple.toFixed(2)}R</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics (for closed positions) */}
          {!isOpen && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {position.trade_grade && (
                    <div>
                      <p className="text-muted-foreground mb-1">Grade</p>
                      <Badge variant={
                        position.trade_grade === 'A' ? 'default' :
                        position.trade_grade === 'B' ? 'secondary' :
                        'destructive'
                      }>
                        {position.trade_grade}
                      </Badge>
                    </div>
                  )}
                  {position.execution_quality && (
                    <div>
                      <p className="text-muted-foreground mb-1">Execution</p>
                      <p className="font-medium">{position.execution_quality}/10</p>
                    </div>
                  )}
                  {position.emotional_score && (
                    <div>
                      <p className="text-muted-foreground mb-1">Emotional</p>
                      <p className="font-medium">{position.emotional_score}/10</p>
                    </div>
                  )}
                  {position.followed_plan !== null && (
                    <div>
                      <p className="text-muted-foreground mb-1">Followed Plan</p>
                      <Badge variant={position.followed_plan ? 'default' : 'destructive'}>
                        {position.followed_plan ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Targets Tab */}
        <TabsContent value="targets">
          <Card>
            <CardHeader>
              <CardTitle>Profit Targets</CardTitle>
              <CardDescription>
                {targets && targets.length > 0 
                  ? `${targets.length} target${targets.length > 1 ? 's' : ''} set`
                  : 'No targets set yet'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {targets && targets.length > 0 ? (
                <div className="space-y-4">
                  {targets.map((target: any) => (
                    <div key={target.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Target {target.target_number}</div>
                        <div className="text-sm text-muted-foreground">
                          ${target.target_price?.toFixed(2)} ({target.percent_allocation}% allocation)
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={target.status === 'hit' ? 'default' : 'outline'}>
                          {target.status}
                        </Badge>
                        {target.r_multiple && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {target.r_multiple.toFixed(2)}R
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No targets set. Use the Target Manager to add profit targets.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityTimeline positionId={position.id} ticker={position.ticker} />
        </TabsContent>

        {/* Journal Tab */}
        <TabsContent value="journal">
          <div className="space-y-4">
            {position.lessons_learned && (
              <Card>
                <CardHeader>
                  <CardTitle>Lessons Learned</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{position.lessons_learned}</p>
                </CardContent>
              </Card>
            )}
            {position.mistakes_made && (
              <Card>
                <CardHeader>
                  <CardTitle>Mistakes Made</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{position.mistakes_made}</p>
                </CardContent>
              </Card>
            )}
            {position.exit_plan && (
              <Card>
                <CardHeader>
                  <CardTitle>Exit Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{position.exit_plan}</p>
                </CardContent>
              </Card>
            )}
            {!position.lessons_learned && !position.mistakes_made && !position.exit_plan && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No journal entries yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
