import Link from 'next/link'

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

async function fetchProducts(): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
  const url = `${base}/api/public/marketplace/products?limit=24`

  // NOTE: This is a public page; no auth cookies required.
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const data = await res.json().catch(() => ({}))
  return data.items || []
}

export default async function MarketplacePage() {
  const products = await fetchProducts()

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Browse digital products (indicators, code, systems). Purchasing and downloading requires membership.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/marketplace/${p.slug}`}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{p.type}</div>
              <div className="mt-1 text-lg font-semibold">{p.title}</div>
              <div className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</div>
              <div className="mt-4 text-sm font-medium">
                {(p.price_cents / 100).toFixed(2)} {p.currency}
              </div>
            </Link>
          ))}

          {products.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
              No products yet.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

