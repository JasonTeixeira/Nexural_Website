'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Maximize,
  ArrowDown,
  ArrowUp,
  Shield,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  Percent,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface OptionLeg {
  id: string
  leg_type: 'short_put' | 'long_put' | 'short_call' | 'long_call'
  strike: number
  expiration: string
  contracts: number
  premium: number
  option_symbol: string
  side: 'buy' | 'sell'
  filled_price?: number
  current_price?: number
  leg_order: number
}

interface OptionsPosition {
  id: string
  ticker: string
  company_name: string
  position_type: 'put_credit_spread' | 'call_credit_spread' | 'iron_condor'
  expiration_date: string
  days_to_expiration: number
  premium_collected: number
  max_profit: number
  max_loss: number
  break_even_lower?: number
  break_even_upper?: number
  probability_of_profit?: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  is_hedge?: boolean
  legs: OptionLeg[]
}

interface OptionsPositionCardProps {
  position: OptionsPosition
  onManage?: () => void
}

export function OptionsPositionCard({ position, onManage }: OptionsPositionCardProps) {
  const getStrategyInfo = () => {
    switch (position.position_type) {
      case 'put_credit_spread':
        return {
          icon: TrendingUp,
          label: 'BULL PUT SPREAD',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          iconColor: 'text-green-400',
        }
      case 'call_credit_spread':
        return {
          icon: TrendingDown,
          label: 'BEAR CALL SPREAD',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          iconColor: 'text-red-400',
        }
      case 'iron_condor':
        return {
          icon: Maximize,
          label: 'IRON CONDOR',
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          iconColor: 'text-purple-400',
        }
    }
  }

  const getLegIcon = (legType: string) => {
    switch (legType) {
      case 'short_put':
        return <ArrowDown className="w-4 h-4 text-red-400" />
      case 'long_put':
        return <Shield className="w-4 h-4 text-blue-400" />
      case 'short_call':
        return <ArrowUp className="w-4 h-4 text-red-400" />
      case 'long_call':
        return <Shield className="w-4 h-4 text-blue-400" />
      default:
        return null
    }
  }

  const getLegLabel = (legType: string, side: string) => {
    const action = side === 'sell' ? 'SELL' : 'BUY'
    const optionType = legType.includes('put') ? 'Put' : 'Call'
    return `${action} ${optionType}`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const strategy = getStrategyInfo()
  const StrategyIcon = strategy.icon

  // Sort legs by leg_order
  const sortedLegs = [...position.legs].sort((a, b) => a.leg_order - b.leg_order)

  // Group legs for iron condor (put spread and call spread)
  const putSpreadLegs = sortedLegs.filter(leg => leg.leg_type.includes('put'))
  const callSpreadLegs = sortedLegs.filter(leg => leg.leg_type.includes('call'))

  const dteColor = position.days_to_expiration <= 7 
    ? 'text-red-400' 
    : position.days_to_expiration <= 21 
    ? 'text-yellow-400' 
    : 'text-green-400'

  const pnlColor = position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <Card className="premium-card border-l-4 border-l-primary hover:border-l-primary/80 transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StrategyIcon className={`w-5 h-5 ${strategy.iconColor}`} />
              <Badge className={strategy.color}>
                {strategy.label}
              </Badge>
              {position.is_hedge && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  HEDGE
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{position.ticker}</h3>
            <p className="text-sm text-muted-foreground">{position.company_name}</p>
          </div>
          
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              <Calendar className="w-3 h-3 mr-1" />
              <span className={dteColor}>{position.days_to_expiration} DTE</span>
            </Badge>
            <p className="text-xs text-muted-foreground">
              Exp: {format(new Date(position.expiration_date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Put Spread (for put credit spread or iron condor) */}
        {putSpreadLegs.length > 0 && (
          <div className="space-y-2">
            {position.position_type === 'iron_condor' && (
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-green-400" />
                Put Spread
              </h4>
            )}
            <div className="glass-card p-3 space-y-2">
              {putSpreadLegs.map((leg) => (
                <div key={leg.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getLegIcon(leg.leg_type)}
                    <span className="text-white">
                      {getLegLabel(leg.leg_type, leg.side)} ${leg.strike.toFixed(2)} x{leg.contracts}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={leg.side === 'sell' ? 'text-green-400' : 'text-red-400'}>
                      {leg.side === 'sell' ? '+' : '-'}{formatCurrency(Math.abs(leg.premium * leg.contracts))}
                    </span>
                    {leg.current_price && (
                      <span className="text-xs text-muted-foreground">
                        @ ${leg.current_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {putSpreadLegs.length === 2 && (
                <div className="pt-2 border-t border-white/10 text-xs text-muted-foreground">
                  Width: ${Math.abs(putSpreadLegs[0].strike - putSpreadLegs[1].strike).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call Spread (for call credit spread or iron condor) */}
        {callSpreadLegs.length > 0 && (
          <div className="space-y-2">
            {position.position_type === 'iron_condor' && (
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-red-400" />
                Call Spread
              </h4>
            )}
            <div className="glass-card p-3 space-y-2">
              {callSpreadLegs.map((leg) => (
                <div key={leg.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getLegIcon(leg.leg_type)}
                    <span className="text-white">
                      {getLegLabel(leg.leg_type, leg.side)} ${leg.strike.toFixed(2)} x{leg.contracts}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={leg.side === 'sell' ? 'text-green-400' : 'text-red-400'}>
                      {leg.side === 'sell' ? '+' : '-'}{formatCurrency(Math.abs(leg.premium * leg.contracts))}
                    </span>
                    {leg.current_price && (
                      <span className="text-xs text-muted-foreground">
                        @ ${leg.current_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {callSpreadLegs.length === 2 && (
                <div className="pt-2 border-t border-white/10 text-xs text-muted-foreground">
                  Width: ${Math.abs(callSpreadLegs[0].strike - callSpreadLegs[1].strike).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Premium</span>
            </div>
            <p className="text-sm font-bold text-green-400">
              {formatCurrency(position.premium_collected)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Max Profit</span>
            </div>
            <p className="text-sm font-bold text-white">
              {formatCurrency(position.max_profit)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Max Loss</span>
            </div>
            <p className="text-sm font-bold text-red-400">
              {formatCurrency(position.max_loss)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Percent className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">P&L</span>
            </div>
            <p className={`text-sm font-bold ${pnlColor}`}>
              {formatCurrency(position.unrealized_pnl)}
            </p>
            <p className={`text-xs ${pnlColor}`}>
              {position.unrealized_pnl >= 0 ? '+' : ''}{position.unrealized_pnl_pct.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Break-evens & PoP */}
        {(position.break_even_lower || position.break_even_upper || position.probability_of_profit) && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
            {position.break_even_lower && (
              <div className="text-center">
                <p className="text-muted-foreground mb-1">Lower B/E</p>
                <p className="text-white font-semibold">${position.break_even_lower.toFixed(2)}</p>
              </div>
            )}
            {position.break_even_upper && (
              <div className="text-center">
                <p className="text-muted-foreground mb-1">Upper B/E</p>
                <p className="text-white font-semibold">${position.break_even_upper.toFixed(2)}</p>
              </div>
            )}
            {position.probability_of_profit && (
              <div className="text-center">
                <p className="text-muted-foreground mb-1">PoP</p>
                <p className="text-primary font-semibold">{position.probability_of_profit.toFixed(0)}%</p>
              </div>
            )}
          </div>
        )}

        {/* Option Symbols (for reference) */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-muted-foreground mb-2">Option Symbols:</p>
          <div className="flex flex-wrap gap-1">
            {sortedLegs.map((leg) => (
              <Badge key={leg.id} variant="outline" className="text-xs font-mono">
                {leg.option_symbol}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
