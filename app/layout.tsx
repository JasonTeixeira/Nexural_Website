import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { ConditionalLayout } from "@/components/conditional-layout"
import { ErrorBoundaryEnhanced } from "@/components/error-boundary-enhanced"

// Initialize background services (Databento, etc.)
import "@/lib/startup"

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-work-sans",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nexural Trading - Advanced Trading Intelligence | AI-Powered Stock Analysis",
  description:
    "Transform your trading with cutting-edge AI technology. Get real-time market insights, advanced scanning algorithms, and join 10,000+ successful traders. Built by developers for traders.",
  generator: "v0.app",
  keywords: [
    "AI trading",
    "stock analysis",
    "trading intelligence",
    "market scanning",
    "algorithmic trading",
    "trading community",
    "AI stock picker",
    "trading signals",
    "market analysis",
    "trading bot",
  ].join(", "),
  authors: [{ name: "Nexural Trading Team" }],
  creator: "Nexural Trading",
  publisher: "Nexural Trading",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Nexural Trading - Advanced Trading Intelligence",
    description:
      "AI-powered trading platform with proprietary algorithms. Join 10,000+ traders achieving 40%+ returns.",
    type: "website",
    locale: "en_US",
    siteName: "Nexural Trading",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nexural Trading Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexural Trading - Advanced Trading Intelligence",
    description: "AI-powered trading platform with proprietary algorithms",
    images: ["/og-image.jpg"],
    creator: "@NexuralTrading",
  },
  alternates: {
    canonical: "https://nexural.com",
  },
  category: "finance",
}

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground">Loading Nexural Trading...</p>
    </div>
  </div>
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0891b2" />
        <meta name="color-scheme" content="dark light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ErrorBoundaryEnhanced>
          <ConditionalLayout>
            <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
          </ConditionalLayout>
        </ErrorBoundaryEnhanced>
      </body>
    </html>
  )
}
