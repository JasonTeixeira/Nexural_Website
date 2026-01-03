"use client"

import { AlertTriangle, Shield, BookOpen } from "lucide-react"

export function RiskDisclaimer() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Important Risk Disclosure</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-base leading-relaxed">
                  <strong className="text-foreground">Educational Content Only:</strong> All analysis, stock picks, and
                  educational materials provided by Nexural Trading are for educational and informational purposes only.
                  This is not personalized investment advice.
                </p>
                <p className="text-base leading-relaxed">
                  <strong className="text-foreground">Investment Risk:</strong> All investments carry risk of loss. Past
                  performance does not guarantee future results. You may lose some or all of your invested capital.
                </p>
                <p className="text-base leading-relaxed">
                  <strong className="text-foreground">Your Responsibility:</strong> All investment decisions are your
                  own responsibility. Conduct your own research and consult with qualified financial advisors before
                  making investment decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">No Guarantees</h3>
                <p className="text-sm text-muted-foreground">
                  We provide no guarantees of profits or returns. All trading and investing involves substantial risk of
                  loss.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Educational Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Our platform focuses on financial education and analysis methodology, not guaranteed investment
                  outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
