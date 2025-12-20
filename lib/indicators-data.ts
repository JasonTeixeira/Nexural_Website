import { 
  TrendingUp, 
  ArrowUpCircle, 
  Target, 
  Zap, 
  BarChart2, 
  Rocket, 
  BarChart3, 
  DollarSign, 
  Volume2, 
  Shield, 
  Layers, 
  Activity, 
  LayoutDashboard, 
  Building2,
  Crosshair,
  Radio,
  type LucideIcon
} from "lucide-react"

export interface Indicator {
  id: string
  name: string
  category: 'trend' | 'momentum' | 'volume' | 'volatility' | 'multi-purpose'
  description: string
  features: string[]
  tradingViewUrl: string
  badge?: 'popular' | 'new' | 'pro-favorite'
  icon: LucideIcon
}

export const indicators: Indicator[] = [
  // Trend Indicators
  {
    id: 'nexural-orb',
    name: 'Nexural ORB',
    category: 'trend',
    description: 'Professional Opening Range Breakout system with dynamic support/resistance zones and breakout signals for intraday trading.',
    features: [
      'Auto-detected opening range zones',
      'Visual breakout signals and alerts',
      'Premium/discount zone identification',
      'Multi-timeframe session analysis'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/1neAAxvI-Nexural-ORB/',
    badge: 'popular',
    icon: Target
  },
  {
    id: 'nexural-qwap',
    name: 'Nexural QWAP',
    category: 'trend',
    description: 'Quantum Weighted Average Price indicator with adaptive bands and regime detection for institutional-level price action analysis.',
    features: [
      'Quantum-weighted price calculation',
      'Adaptive trend bands',
      'Regime change detection',
      'Real-time bias indicator'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/giUxYYpp-Nexural-QWAP/',
    badge: 'popular',
    icon: Radio
  },
  {
    id: 'cvd-trendline',
    name: 'CVD Trendline',
    category: 'trend',
    description: 'Cumulative Volume Delta trendline system that tracks institutional order flow to identify true trend direction and reversals.',
    features: [
      'Real-time CVD trend tracking',
      'Buy/sell pressure visualization',
      'Divergence detection',
      'Trend strength confirmation'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/o70Bf93Y-CVD-Trendline/',
    icon: TrendingUp
  },
  {
    id: 'nexural-jma',
    name: 'Nexural JMA',
    category: 'trend',
    description: 'Jurik Moving Average with integrated dashboard showing trend, momentum, volume, and volatility in one comprehensive view.',
    features: [
      'Zero-lag Jurik MA algorithm',
      'Multi-metric dashboard display',
      'Trend strength percentage',
      'All-in-one market condition analysis'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/2Y3UUtQF-Nexural-JMA/',
    badge: 'pro-favorite',
    icon: LayoutDashboard
  },
  {
    id: 'vhull-adaptive',
    name: 'VHull Adaptive',
    category: 'trend',
    description: 'Adaptive Hull Moving Average that automatically adjusts to market volatility for precise trend following across all conditions.',
    features: [
      'Volatility-adaptive algorithm',
      'Smooth trend identification',
      'Color-coded trend direction',
      'Works on all timeframes'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/PWW5kn8N-VHull-Adaptive/',
    icon: ArrowUpCircle
  },

  // Momentum Indicators
  {
    id: 'nexural-fisher-pro',
    name: 'Nexural Fisher Pro',
    category: 'momentum',
    description: 'Advanced Fisher Transform oscillator with normalized signals and trend identification for high-probability momentum trades.',
    features: [
      'Normalized Fisher Transform',
      'Overbought/oversold zones',
      'Trend-aligned signals',
      'Divergence highlighting'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/L5m5IGPh-Nexural-Fisher-Pro/',
    badge: 'popular',
    icon: Zap
  },
  {
    id: 'nexural-transform',
    name: 'Nexural Transform',
    category: 'momentum',
    description: 'Proprietary price transformation algorithm that identifies momentum extremes and reversal points with exceptional accuracy.',
    features: [
      'Advanced transformation logic',
      'Momentum extreme detection',
      'Multi-level threshold zones',
      'Reversal point identification'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/HpRiSQJy-Nexural-Transform/',
    badge: 'pro-favorite',
    icon: Rocket
  },
  {
    id: 'quant-rsi',
    name: 'Quant RSI',
    category: 'momentum',
    description: 'Quantitative RSI with enhanced divergence detection and color-coded momentum zones for professional momentum analysis.',
    features: [
      'Quantitative RSI calculation',
      'Automatic divergence detection',
      'Color-coded momentum states',
      'Customizable overbought/oversold levels'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/3BRMHlDz-Quant-RSI/',
    icon: BarChart2
  },
  {
    id: 'qpulse',
    name: 'QPulse',
    category: 'momentum',
    description: 'Momentum pulse detector with auto-detect settings and zero-centered oscillator for identifying momentum shifts.',
    features: [
      'Automated parameter detection',
      'Zero-centered momentum oscillator',
      'Buy/sell pressure visualization',
      'Momentum divergence alerts'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/0KLRDziQ-QPulse/',
    icon: Activity
  },

  // Volume Indicators
  {
    id: 'nexural-flow-pro',
    name: 'Nexural Flow Pro',
    category: 'volume',
    description: 'Professional volume flow analysis with balanced/biased detection and visual buy/sell pressure for institutional tracking.',
    features: [
      'Real-time volume flow tracking',
      'Buy/sell imbalance detection',
      'Balanced vs biased identification',
      'Multi-timeframe volume analysis'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/eEOlZkdZ-Nexural-Flow-Pro/',
    badge: 'popular',
    icon: Volume2
  },
  {
    id: 'nexural-orderflow-matrix',
    name: 'Nexural OrderFlow Matrix',
    category: 'volume',
    description: 'Institutional-grade order flow heatmap showing real-time auction market data and imbalances for smart money tracking.',
    features: [
      'Real-time order flow heatmap',
      'Auction market theory integration',
      'Volume profile visualization',
      'Institutional imbalance detection'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/ATy7J43b-Nexural-OrderFlow-Matrix/',
    badge: 'pro-favorite',
    icon: Building2
  },

  // Volatility Indicators
  {
    id: 'ace-squeeze',
    name: 'ACE Squeeze',
    category: 'volatility',
    description: 'Advanced volatility squeeze detector with isolated and dotted states for explosive breakout identification.',
    features: [
      'Multi-state squeeze detection',
      'Breakout direction prediction',
      'Squeeze strength visualization',
      'Early warning system'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/TJqzcrwM-ACE-Squeeze/',
    icon: Layers
  },
  {
    id: 'qfa-volatility-meter',
    name: 'QFA Volatility Meter',
    category: 'volatility',
    description: 'Quantitative volatility measurement system with color-coded bars showing expansion and contraction phases.',
    features: [
      'Real-time volatility measurement',
      'Color-coded volatility states',
      'Expansion/contraction detection',
      'Historical volatility comparison'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/i5aBpluz-QFA-Volatility-Meter/',
    icon: Shield
  },
  {
    id: 'qvs-pro',
    name: 'QVS Pro™ - Raw Volatility Edition',
    category: 'volatility',
    description: 'Professional raw volatility system with multi-timeframe analysis, ATR engine, and volatility regime identification.',
    features: [
      'Raw volatility calculation',
      'ATR-based engine',
      'Multi-timeframe volatility sync',
      'Regime change detection'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/TWPLF6Q2-QVS-Pro-Raw-Volatility-Edition/',
    badge: 'pro-favorite',
    icon: Activity
  },

  // Multi-Purpose Indicators
  {
    id: 'nexural-regime-matrix',
    name: 'Nexural Regime Matrix',
    category: 'multi-purpose',
    description: 'Market regime identification system with visual matrix display showing trend, chop, and transition states in real-time.',
    features: [
      'Real-time regime classification',
      'Visual matrix display',
      'Trend/chop/transition detection',
      'Multi-dimensional market analysis'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/JHpcwKZA-Nexural-Regime-Matrix/',
    badge: 'popular',
    icon: LayoutDashboard
  },
  {
    id: 'nexural-di-pressure',
    name: 'Nexural DI Pressure Imbalance',
    category: 'multi-purpose',
    description: 'Directional pressure imbalance detector tracking buying and selling pressure with divergence identification.',
    features: [
      'Real-time pressure imbalance',
      'Buy/sell pressure tracking',
      'Divergence detection system',
      'Pressure extreme identification'
    ],
    tradingViewUrl: 'https://www.tradingview.com/script/Azb15ofg-Nexural-DI-Pressure-Imbalance/',
    icon: DollarSign
  }
]

export const categories = [
  { id: 'all', name: 'All Indicators', iconComponent: BarChart3 },
  { id: 'trend', name: 'Trend', iconComponent: TrendingUp },
  { id: 'momentum', name: 'Momentum', iconComponent: Zap },
  { id: 'volume', name: 'Volume', iconComponent: Volume2 },
  { id: 'volatility', name: 'Volatility', iconComponent: Activity },
  { id: 'multi-purpose', name: 'Multi-Purpose', iconComponent: LayoutDashboard }
]
