"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
)

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  const pricingPlans = [
    {
      name: "Newsletter",
      monthlyPrice: "$0",
      annualPrice: "$0",
      description: "Perfect for investors starting their journey.",
      features: [
        "Weekly high-growth stock picks",
        "Basic AI analysis insights",
        "Growth formula explanations",
        "Email delivery every Sunday",
        "Access to educational content",
      ],
      buttonText: "Start Free Newsletter",
      buttonClass:
        "bg-zinc-300 shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] outline outline-0.5 outline-[#1e29391f] outline-offset-[-0.5px] text-gray-800 text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-zinc-400 transform hover:scale-105 transition-all duration-200",
      icon: SparklesIcon,
    },
    {
      name: "FREE Discord Community",
      monthlyPrice: "FREE",
      annualPrice: "FREE",
      description: "100% Free - Join our active trading community.",
      features: [
        "Real-time stock alerts & analysis",
        "Daily market insights & commentary",
        "Direct access to trading community",
        "Live Q&A sessions with analysts",
        "Advanced AI screening results",
        "Portfolio review & feedback",
        "Priority support & notifications",
      ],
      buttonText: "Join FREE Community",
      buttonClass:
        "bg-primary-foreground shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] text-primary text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-primary-foreground/90 transform hover:scale-105 transition-all duration-200",
      popular: true,
      icon: ZapIcon,
    },
    {
      name: "AI Auto-Trading",
      monthlyPrice: "Coming",
      annualPrice: "Coming",
      description: "Automated trading based on our formulas.",
      features: [
        "Fully automated portfolio management",
        "AI-driven buy/sell execution",
        "Risk management protocols",
        "Real-time performance tracking",
        "Custom strategy implementation",
      ],
      buttonText: "Join Waitlist",
      buttonClass:
        "bg-secondary shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] text-secondary-foreground text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-secondary/90 transform hover:scale-105 transition-all duration-200",
      comingSoon: true,
      launchDate: "Late 2026",
      icon: ClockIcon,
    },
  ]

  return (
    <section className="w-full px-4 sm:px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
      <div className="self-stretch relative flex flex-col justify-center items-center gap-2 py-0">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight md:leading-[40px] text-balance px-4">
            Choose Your Investment Edge
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-medium leading-tight text-pretty px-4 max-w-2xl">
            From free weekly picks to premium Discord community access. <br className="hidden sm:block" /> Start with
            our newsletter and upgrade when you're ready for more.
          </p>
        </div>
        <div className="pt-4">
          <div className="p-0.5 bg-muted rounded-lg outline outline-1 outline-[#0307120a] outline-offset-[-1px] flex justify-start items-center gap-1 md:mt-0 hover:shadow-md transition-shadow duration-200">
            <button
              onClick={() => setIsAnnual(true)}
              className={`pl-2 pr-1 py-1 flex justify-start items-start gap-2 rounded-md transition-all duration-200 ${isAnnual ? "bg-accent shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)] scale-105" : "hover:bg-accent/50"}`}
            >
              <span
                className={`text-center text-sm font-medium leading-tight transition-colors duration-200 ${isAnnual ? "text-accent-foreground" : "text-zinc-400"}`}
              >
                Annually
              </span>
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-2 py-1 flex justify-start items-start rounded-md transition-all duration-200 ${!isAnnual ? "bg-accent shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)] scale-105" : "hover:bg-accent/50"}`}
            >
              <span
                className={`text-center text-sm font-medium leading-tight transition-colors duration-200 ${!isAnnual ? "text-accent-foreground" : "text-zinc-400"}`}
              >
                Monthly
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="self-stretch px-2 sm:px-5 flex flex-col lg:flex-row justify-start items-stretch gap-4 md:gap-6 mt-6 max-w-[1100px] mx-auto">
        {pricingPlans.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`flex-1 p-4 sm:p-6 overflow-hidden rounded-xl flex flex-col justify-start items-start gap-4 sm:gap-6 transition-all duration-300 cursor-pointer min-h-[500px] ${
                plan.popular
                  ? "bg-primary shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.10)] hover:shadow-[0px_8px_16px_-4px_rgba(0,0,0,0.15)] transform hover:scale-105"
                  : "bg-gradient-to-b from-gray-50/5 to-gray-50/0 hover:shadow-lg hover:scale-105"
              } ${hoveredPlan === plan.name ? "ring-2 ring-primary/20" : ""}`}
              style={plan.popular ? {} : { outline: "1px solid hsl(var(--border))", outlineOffset: "-1px" }}
            >
              <div className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-6">
                <div className="self-stretch flex flex-col justify-start items-start gap-6 sm:gap-8">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                      <div
                        className={`text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground" : "text-zinc-200"}`}
                      >
                        {plan.name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {plan.popular && (
                        <div className="px-2 overflow-hidden rounded-full justify-center items-center gap-2.5 inline-flex py-0.5 bg-gradient-to-b from-primary-light/50 to-primary-light bg-white animate-pulse">
                          <div className="text-center text-primary-foreground text-xs font-normal leading-tight break-words">
                            Most Popular
                          </div>
                        </div>
                      )}
                      {plan.comingSoon && (
                        <div className="px-2 overflow-hidden rounded-full justify-center items-center gap-1.5 inline-flex py-0.5 bg-gradient-to-b from-amber-400/20 to-amber-500/20 border border-amber-500/30">
                          <ClockIcon />
                          <div className="text-center text-amber-400 text-xs font-normal leading-tight break-words">
                            {plan.launchDate}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <div className="flex justify-start items-center gap-1.5">
                      <div
                        className={`relative h-10 flex items-center text-2xl sm:text-3xl font-medium leading-10 ${plan.popular ? "text-primary-foreground" : "text-zinc-50"}`}
                      >
                        {plan.comingSoon ? (
                          <span className="text-xl sm:text-2xl">Coming Soon</span>
                        ) : (
                          <>
                            <span className="invisible">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                            <span
                              className="absolute inset-0 flex items-center transition-all duration-500"
                              style={{
                                opacity: isAnnual ? 1 : 0,
                                transform: `scale(${isAnnual ? 1 : 0.8}) ${hoveredPlan === plan.name ? "translateY(-2px)" : ""}`,
                                filter: `blur(${isAnnual ? 0 : 4}px)`,
                              }}
                              aria-hidden={!isAnnual}
                            >
                              {plan.annualPrice}
                            </span>
                            <span
                              className="absolute inset-0 flex items-center transition-all duration-500"
                              style={{
                                opacity: !isAnnual ? 1 : 0,
                                transform: `scale(${!isAnnual ? 1 : 0.8}) ${hoveredPlan === plan.name ? "translateY(-2px)" : ""}`,
                                filter: `blur(${!isAnnual ? 0 : 4}px)`,
                              }}
                              aria-hidden={isAnnual}
                            >
                              {plan.monthlyPrice}
                            </span>
                          </>
                        )}
                      </div>
                      {!plan.comingSoon && plan.monthlyPrice !== "FREE" && (
                        <div
                          className={`text-center text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground/70" : "text-zinc-400"}`}
                        >
                          /month
                        </div>
                      )}
                    </div>
                    <div
                      className={`self-stretch text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground/70" : "text-zinc-400"}`}
                    >
                      {plan.description}
                    </div>
                  </div>
                </div>
                <Button
                  className={`self-stretch px-4 sm:px-5 py-3 sm:py-2 rounded-[40px] flex justify-center items-center ${plan.buttonClass} group text-sm sm:text-base`}
                >
                  <div className="px-1.5 flex justify-center items-center gap-2">
                    <span
                      className={`text-center font-medium leading-tight transition-all duration-200 group-hover:scale-105 ${plan.name === "Newsletter" ? "text-gray-800" : plan.name === "Discord Premium" ? "text-primary" : "text-zinc-950"}`}
                    >
                      {plan.buttonText}
                    </span>
                  </div>
                </Button>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div
                  className={`self-stretch text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {plan.name === "Newsletter"
                    ? "What you get:"
                    : plan.name === "Discord Premium"
                      ? "Everything in Newsletter +"
                      : "Premium features:"}
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  {plan.features.map((feature, index) => (
                    <div
                      key={feature}
                      className="self-stretch flex justify-start items-start gap-2 group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <CheckIcon />
                      </div>
                      <div
                        className={`leading-tight font-normal text-sm text-left transition-all duration-200 group-hover:translate-x-1 ${plan.popular ? "text-primary-foreground" : "text-muted-foreground"}`}
                      >
                        {feature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
