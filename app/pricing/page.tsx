import { PricingHero } from "@/components/pricing-hero"
import { AIProcessVisualization } from "@/components/ai-process-visualization"
import { ValuePropositionCharts } from "@/components/value-proposition-charts"
import { AnimatedSection } from "@/components/animated-section"
import { SimplePricingFAQ } from "@/components/simple-pricing-faq"
import { FinalPricingCTA } from "@/components/final-pricing-cta"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <div className="relative z-10 pt-12">
        <main className="max-w-[1320px] mx-auto relative">
          {/* Hero with Pricing Tiers */}
          <PricingHero />

          {/* Why It Works - Value Proposition */}
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-20" delay={0.1}>
            <ValuePropositionCharts />
          </AnimatedSection>

          {/* How It Works - AI Process */}
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-20" delay={0.15}>
            <AIProcessVisualization />
          </AnimatedSection>

          {/* Quick FAQ */}
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-20" delay={0.2}>
            <SimplePricingFAQ />
          </AnimatedSection>

          {/* Final CTA */}
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-20 mb-20" delay={0.25}>
            <FinalPricingCTA />
          </AnimatedSection>
        </main>
      </div>
    </div>
  )
}
