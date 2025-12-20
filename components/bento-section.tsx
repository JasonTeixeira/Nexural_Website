import TradingSignalsIllustration from "./bento/trading-signals-illustration"
import MarketAnalysisIllustration from "./bento/market-analysis-illustration"
import PortfolioTrackingIllustration from "./bento/portfolio-tracking-illustration"
import RiskManagementIllustration from "./bento/risk-management-illustration"
import EducationalResourcesIllustration from "./bento/educational-resources-illustration"
import CommunityInsightsIllustration from "./bento/community-insights-illustration"

const BentoCard = ({ title, description, Component }) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "rgba(231, 236, 235, 0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-lg font-normal leading-7">
          {title} <br />
          <span className="text-muted-foreground">{description}</span>
        </p>
      </div>
    </div>
    <div className="self-stretch h-72 relative -mt-0.5 z-10">
      <Component />
    </div>
  </div>
)

export function BentoSection() {
  const cards = [
    {
      title: "AI-Powered Stock Analysis",
      description: "Get real-time market insights with advanced AI algorithms analyzing thousands of data points.",
      Component: TradingSignalsIllustration,
    },
    {
      title: "Live Market Scanning",
      description: "Continuous monitoring of market conditions with instant alerts on high-probability setups.",
      Component: MarketAnalysisIllustration,
    },
    {
      title: "Portfolio Performance Tracking",
      description: "Track your investments with detailed analytics and performance metrics in real-time.",
      Component: PortfolioTrackingIllustration,
    },
    {
      title: "Advanced Risk Management",
      description: "Sophisticated risk assessment tools to protect your capital and optimize position sizing.",
      Component: RiskManagementIllustration,
    },
    {
      title: "Educational Trading Resources",
      description: "Comprehensive learning materials, tutorials, and market analysis to improve your skills.",
      Component: EducationalResourcesIllustration,
    },
    {
      title: "Community Insights & Discord",
      description: "Join our active trading community for discussions, insights, and real-time market updates.",
      Component: CommunityInsightsIllustration,
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              Advanced Trading Intelligence
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              Leverage cutting-edge AI technology to analyze markets, identify opportunities, and make informed trading decisions with confidence build and used by Sage
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
