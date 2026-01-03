import { HeroSection } from "@/components/marketing/hero-section"
import { AnimatedSection } from "@/components/animated-section"
import dynamic from 'next/dynamic'

// Client-only components (prevent hydration errors)
const SocialProofNotifications = dynamic(() => import('@/components/social-proof-notifications').then(mod => ({ default: mod.SocialProofNotifications })), { ssr: false })
const ExitPopup = dynamic(() => import('@/components/exit-popup').then(mod => ({ default: mod.ExitPopup })), { ssr: false })
const AdminPositionsFeed = dynamic(() => import('@/components/admin-positions-feed').then(mod => ({ default: mod.AdminPositionsFeed })), { ssr: false })

import { RiskDisclaimer } from "@/components/risk-disclaimer"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { NoBSPromise } from "@/components/no-bs-promise"
import { ErrorBoundary } from "@/components/error-boundary"
import { MobileNavigation } from "@/components/mobile-navigation"
import { ConversionTracking } from "@/components/conversion-tracking"
import { GettingStartedJourney } from "@/components/getting-started-journey"
import { FAQAccordionInline } from "@/components/faq-accordion-inline"
import { TrustBadges } from "@/components/trust-badges"
import { CTASection } from "@/components/cta-section"
import Link from "next/link"
import {
  SkipToContent,
  KeyboardNavigation,
  FocusManager,
  ReducedMotionSupport,
} from "@/components/accessibility-improvements"

// NEW: Import the platform showcase components
import { LivePositionsTicker } from "@/components/live-positions-ticker"
import { CommunityShowcaseHomepage } from "@/components/community-showcase-homepage"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { WhoThisIsFor } from "@/components/who-this-is-for"

export default function LandingPage() {
  return (
    <ErrorBoundary>
      <SkipToContent />
      <KeyboardNavigation />
      <FocusManager />
      <ReducedMotionSupport />
      <ConversionTracking />
      <MobileNavigation />
      <div className="min-h-screen hero-gradient">
        {/* Hero Section */}
        <section className="relative overflow-hidden w-full" id="main-content">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
          <div className="relative z-10">
            <HeroSection />
          </div>
        </section>

        {/* NEW: Live Positions Ticker - Shows REAL trading activity */}
        <LivePositionsTicker />

        {/* NEW: Who This Is For - Qualification Section */}
        <section className="py-20 bg-background" aria-label="Who This Is For">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.08}>
              <WhoThisIsFor />
            </AnimatedSection>
          </div>
        </section>

        {/* NEW: Admin Positions Feed - YOUR current trades */}
        <section className="py-16 bg-card/50" aria-label="Live Trading Positions">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.1}>
              <AdminPositionsFeed />
            </AnimatedSection>
          </div>
        </section>

        {/* How It Works Section - Moved UP */}
        <section id="how-it-works" className="py-16 bg-card/50" aria-label="How It Works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.12}>
              <HowItWorksSection />
            </AnimatedSection>
          </div>
        </section>

        {/* Getting Started Journey - Moved UP */}
        <section className="py-16 bg-background" aria-label="Getting Started">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.14}>
              <GettingStartedJourney />
            </AnimatedSection>
          </div>
        </section>

        {/* NEW: Community Showcase - Top traders & social proof */}
        <section className="py-16 bg-card/50" aria-label="Community">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Join Our Trading Community
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with traders, compete on the leaderboard, and grow together
              </p>
            </div>
            <AnimatedSection delay={0.16}>
              <CommunityShowcaseHomepage />
            </AnimatedSection>
          </div>
        </section>

        {/* NEW: Testimonials Carousel - Success Stories */}
        <section className="py-20 bg-gradient-to-br from-background via-card/30 to-background" aria-label="Testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.17}>
              <TestimonialsCarousel />
            </AnimatedSection>
          </div>
        </section>

        {/* No BS Promise Section */}
        <section className="py-16 bg-background" aria-label="Our Promise">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.18}>
              <div className="premium-card">
                <NoBSPromise />
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* FREE Community Section - Main CTA */}
        <section className="py-20 bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.2}>
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Start Your Trading Journey
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join FREE today. Track your trades, follow top performers, and compete on the leaderboard.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <a
                    href="https://discord.gg/fTS3Nedk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                  >
                    Join FREE Discord Community
                  </a>
                  <Link
                    href="/auth/signup"
                    className="px-12 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-bold text-lg rounded-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
                  >
                    Create Account
                  </Link>
                </div>
                <p className="text-green-400 font-semibold mt-6">
                  ✓ No payment required • ✓ Instant access • ✓ Always FREE
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 bg-background" aria-label="FAQ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.22}>
              <FAQAccordionInline />
            </AnimatedSection>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10" aria-label="Call to Action">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.24}>
              <CTASection />
            </AnimatedSection>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-8 bg-background border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustBadges variant="footer" />
          </div>
        </section>

        {/* Risk Disclaimer */}
        <section className="py-8 bg-background border-t border-border/50" aria-label="Risk Disclaimer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection delay={0.26}>
              <RiskDisclaimer />
            </AnimatedSection>
          </div>
        </section>

        {/* Background Components - Minimal, non-intrusive */}
        <div className="no-print">
          <SocialProofNotifications />
          <ExitPopup />
        </div>
      </div>
    </ErrorBoundary>
  )
}
