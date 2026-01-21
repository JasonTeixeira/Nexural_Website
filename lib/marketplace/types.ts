export type MarketplaceProductType = 'indicator' | 'code' | 'system' | 'other'
export type MarketplaceProductStatus = 'active' | 'removed'
export type MarketplaceSellerStatus = 'active' | 'suspended'

export interface MarketplaceProduct {
  id: string
  seller_id: string
  slug: string
  type: MarketplaceProductType
  title: string
  description: string
  price_cents: number
  currency: string
  tags: string[]
  status: MarketplaceProductStatus
  created_at: string
  updated_at: string
}

export interface MarketplaceSeller {
  id: string
  user_id: string
  display_name: string
  bio: string | null
  support_email: string | null
  stripe_connect_account_id: string | null
  stripe_connect_onboarded: boolean
  terms_accepted_at: string | null
  status: MarketplaceSellerStatus
  created_at: string
  updated_at: string
}

