// Stripe Pricing Configuration
// All subscription tiers and pricing

export const STRIPE_PRICING = {
  // Existing tiers
  basic: {
    name: 'Basic',
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    price: 99,
    interval: 'month',
    features: [
      'Daily trading signals',
      'Email notifications',
      'Basic analytics',
      'Community access'
    ]
  },
  
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 199,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Real-time signals',
      'Discord notifications',
      'Advanced analytics',
      'Priority support'
    ]
  },
  
  // NEW: Algo Trading tier
  algoTrader: {
    name: 'Algo Trader',
    priceId: process.env.STRIPE_ALGO_TRADER_PRICE_ID,
    price: 299,
    interval: 'month',
    comingSoon: true,
    launchDate: 'Q4 2026',
    betaPrice: 199, // 33% discount for beta testers
    features: [
      'Everything in Pro',
      'Automated trading strategies',
      'Run on your own IB account',
      'Pre-built strategy library',
      'Custom strategy builder',
      'Backtesting tools',
      'Real-time monitoring',
      'Risk management',
      'Priority support',
      'Beta access (Q2 2026)'
    ],
    waitlistUrl: '/algo-trading-beta'
  }
}

// Helper to get pricing by tier
export function getPricing(tier: keyof typeof STRIPE_PRICING) {
  return STRIPE_PRICING[tier]
}

// Helper to check if tier is available
export function isTierAvailable(tier: keyof typeof STRIPE_PRICING): boolean {
  const pricing = STRIPE_PRICING[tier]
  return !pricing.comingSoon
}

// Helper to get all available tiers
export function getAvailableTiers() {
  return Object.entries(STRIPE_PRICING)
    .filter(([_, config]) => !config.comingSoon)
    .map(([key, config]) => ({ key, ...config }))
}

// Helper to get coming soon tiers
export function getComingSoonTiers() {
  return Object.entries(STRIPE_PRICING)
    .filter(([_, config]) => config.comingSoon)
    .map(([key, config]) => ({ key, ...config }))
}

// Discount codes for beta testers
export const BETA_DISCOUNT_CODES = {
  algoTraderBeta: {
    code: 'ALGO_BETA_33',
    percentOff: 33,
    duration: 'forever',
    description: 'Lifetime 33% discount for beta testers'
  }
}

// Helper to apply beta discount
export function getBetaPrice(tier: keyof typeof STRIPE_PRICING): number {
  const pricing = STRIPE_PRICING[tier]
  if ('betaPrice' in pricing && pricing.betaPrice) {
    return pricing.betaPrice
  }
  return pricing.price
}
