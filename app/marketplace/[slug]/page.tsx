import Link from 'next/link'
import { notFound } from 'next/navigation'

type Product = {
  id: string
  slug: string
  type: string
  title: string
  description: string
  price_cents: number
  currency: string
  tags: string[]
}

async function fetchProduct(slug: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
  const url = `${base}/api/public/marketplace/products?limit=1&q=${encodeURIComponent(slug)}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return null
  const data = await res.json().catch(() => ({}))
  const items: Product[] = data.items || []
  return items.find((p) => p.slug === slug) || null
}

export default async function MarketplaceProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) return notFound()

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/marketplace" className="text-sm text-muted-foreground hover:underline">
          ← Back to Marketplace
        </Link>

        <h1 className="mt-4 text-3xl font-bold">{product.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">{product.type}</div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{product.description}</div>
          <div className="mt-6 text-lg font-semibold">
            {(product.price_cents / 100).toFixed(2)} {product.currency}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Purchasing and downloading requires membership. Checkout/entitlements will be added in Phase M4.
          </p>
        </div>
      </div>
    </main>
  )
}

