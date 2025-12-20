'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

// Chart color palette
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  gray: '#6B7280'
}

const CHART_COLORS = [COLORS.primary, COLORS.success, COLORS.purple, COLORS.cyan, COLORS.warning]

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm text-gray-300 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? 
              (entry.name.includes('Rate') || entry.name.includes('%') ? 
                `${entry.value.toFixed(1)}%` : 
                entry.name.includes('$') || entry.dataKey.includes('revenue') || entry.dataKey.includes('pnl') ?
                  `$${entry.value.toLocaleString()}` :
                  entry.value.toLocaleString()
              ) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Revenue Trend Chart
interface RevenueTrendProps {
  data: Array<{ date: string; revenue: number; mrr?: number }>
}

export function RevenueTrendChart({ data }: RevenueTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke={COLORS.primary} 
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Member Growth Chart
interface MemberGrowthProps {
  data: Array<{ date: string; members: number; newMembers?: number }>
}

export function MemberGrowthChart({ data }: MemberGrowthProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="members" 
          stroke={COLORS.success} 
          strokeWidth={2}
          dot={{ fill: COLORS.success, r: 4 }}
          name="Total Members"
        />
        {data[0]?.newMembers !== undefined && (
          <Line 
            type="monotone" 
            dataKey="newMembers" 
            stroke={COLORS.cyan} 
            strokeWidth={2}
            dot={{ fill: COLORS.cyan, r: 4 }}
            name="New Members"
            strokeDasharray="5 5"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

// Signal Win Rate Chart
interface SignalWinRateProps {
  data: Array<{ date: string; winRate: number; target?: number }>
}

export function SignalWinRateChart({ data }: SignalWinRateProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="winRate" 
          stroke={COLORS.success} 
          strokeWidth={3}
          dot={{ fill: COLORS.success, r: 5 }}
          name="Win Rate"
        />
        {data[0]?.target !== undefined && (
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke={COLORS.warning} 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Target"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ML Model Edge Chart
interface MLModelEdgeProps {
  data: Array<{ date: string; ES?: number; NQ?: number; RTY?: number; YM?: number }>
}

export function MLModelEdgeChart({ data }: MLModelEdgeProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
        <Line 
          type="monotone" 
          dataKey="ES" 
          stroke={COLORS.primary} 
          strokeWidth={2}
          dot={{ fill: COLORS.primary, r: 4 }}
          name="ES Model"
        />
        <Line 
          type="monotone" 
          dataKey="RTY" 
          stroke={COLORS.success} 
          strokeWidth={2}
          dot={{ fill: COLORS.success, r: 4 }}
          name="RTY Model"
        />
        <Line 
          type="monotone" 
          dataKey="YM" 
          stroke={COLORS.purple} 
          strokeWidth={2}
          dot={{ fill: COLORS.purple, r: 4 }}
          name="YM Model"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Revenue Breakdown Pie Chart
interface RevenueBreakdownProps {
  data: Array<{ name: string; value: number }>
}

export function RevenueBreakdownChart({ data }: RevenueBreakdownProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Daily P&L Bar Chart
interface DailyPnLProps {
  data: Array<{ date: string; pnl: number }>
}

export function DailyPnLChart({ data }: DailyPnLProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="pnl" 
          fill={COLORS.primary}
          name="P&L"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? COLORS.success : COLORS.danger} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// System Performance Chart
interface SystemPerformanceProps {
  data: Array<{ time: string; cpu: number; memory: number }>
}

export function SystemPerformanceChart({ data }: SystemPerformanceProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="time" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
        <Line 
          type="monotone" 
          dataKey="cpu" 
          stroke={COLORS.primary} 
          strokeWidth={2}
          dot={false}
          name="CPU %"
        />
        <Line 
          type="monotone" 
          dataKey="memory" 
          stroke={COLORS.purple} 
          strokeWidth={2}
          dot={false}
          name="Memory %"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Member Tier Distribution Donut Chart
interface MemberTierProps {
  data: Array<{ name: string; value: number }>
}

export function MemberTierChart({ data }: MemberTierProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }: any) => `${name}: ${value}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
