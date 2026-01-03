"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, HelpCircle } from "lucide-react"

export function SimplePricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "Why is the Community & Education plan completely FREE?",
      answer:
        "We believe financial education should be accessible to everyone. Our mission is to democratize wealth-building knowledge that's typically locked behind expensive paywalls. The FREE plan includes full Discord access, YouTube content, trading indicators, weekly analysis, and live Q&A sessions. We make money from our future OrderFlow Pro platform, not from gatekeeping education."
    },
    {
      question: "When will the OrderFlow Pro platform launch?",
      answer:
        "OrderFlow Pro is scheduled to launch in Q3 2026 (18+ months from now). We're building a professional-grade options orderflow analysis platform with AI-powered scanning and institutional money flow tracking. Join the waitlist to be notified when we launch and get early-bird pricing."
    },
    {
      question: "Can I upgrade to OrderFlow Pro when it launches?",
      answer:
        "Absolutely! All FREE members will have priority access to upgrade when OrderFlow Pro launches. There's no obligation - you can stay on the FREE plan forever or upgrade when the automation platform becomes available. Your learning and community access will never be taken away."
    },
    {
      question: "Do I need a credit card to join the FREE plan?",
      answer:
        "No credit card required! Simply sign up with your email and you'll get instant access to the full Discord community, YouTube educational library, free trading indicators, weekly market analysis, and all our learning resources. No hidden fees, no trials, just FREE forever."
    }
  ]

  return (
    <section className="px-6 py-20 relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.05),transparent_50%)]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            <HelpCircle className="w-3 h-3 mr-1" />
            Common Questions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about our FREE community and future Pro platform
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 shadow-lg shadow-cyan-500/10"
                  : "border-white/10 bg-card/30 hover:border-white/20"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 group"
              >
                <span className={`font-semibold text-lg transition-colors ${
                  openIndex === index ? "text-cyan-300" : "text-foreground group-hover:text-cyan-400"
                }`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                    openIndex === index
                      ? "rotate-180 text-cyan-400"
                      : "text-muted-foreground group-hover:text-cyan-400"
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:support@nexuraltrading.com"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Email Support
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="/faq"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Full FAQ Page
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
