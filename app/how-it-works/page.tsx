import { HowItWorksHero } from "@/components/how-it-works-hero"
import { FounderJourneyTimeline } from "@/components/founder-journey-timeline"
import { SystemVisualization } from "@/components/system-visualization"
import { DashboardMockup } from "@/components/dashboard-mockup"
import { CriticalMetricsGrid } from "@/components/critical-metrics-grid"
import { DecisionFramework } from "@/components/decision-framework"
import { ScoringSystem } from "@/components/scoring-system"
import { HistoricalEvidence } from "@/components/historical-evidence"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Keep as is */}
      <HowItWorksHero />
      
      {/* NEW: Founder Journey Timeline - Visual storytelling of 15-year journey */}
      <FounderJourneyTimeline />
      
      {/* NEW: System Visualization - Animated 80/20 breakdown */}
      <SystemVisualization />
      
      {/* NEW: Dashboard Mockup - Interactive preview of member dashboard */}
      <DashboardMockup />
      
      {/* Existing Technical Sections */}
      <CriticalMetricsGrid />
      <DecisionFramework />
      <ScoringSystem />
      <HistoricalEvidence />
    </div>
  )
}
