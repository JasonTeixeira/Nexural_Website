"use client"

import { AlertTriangle, Shield, FileText, Scale } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LegalDisclaimers() {
  return (
    <section className="w-full py-16 px-5 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Important Legal Disclaimers</h2>
          <p className="text-xl text-muted-foreground">
            Please read and understand these important disclaimers before using our educational platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Investment Risk Warning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All investments carry risk of substantial loss</li>
                <li>• Past performance does not guarantee future results</li>
                <li>• You may lose some or all of your invested capital</li>
                <li>• Market conditions can change rapidly and unpredictably</li>
                <li>• Individual results will vary significantly</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Educational Purpose Only
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All content is for educational purposes only</li>
                <li>• Not personalized investment advice</li>
                <li>• Not recommendations to buy or sell securities</li>
                <li>• Consult qualified financial advisors for advice</li>
                <li>• Make your own independent investment decisions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-500" />
                No Guarantees Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• No guarantees of profits or returns</li>
                <li>• No refunds on subscription fees</li>
                <li>• Results are not typical or guaranteed</li>
                <li>• Performance claims are hypothetical</li>
                <li>• Success depends on many external factors</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-500" />
                Legal Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• We are not registered investment advisors</li>
                <li>• Not responsible for investment decisions</li>
                <li>• Limited liability for educational content</li>
                <li>• Users assume all investment risks</li>
                <li>• Compliance with local regulations required</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-red-500/30 bg-red-500/10">
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4 text-red-500">CRITICAL RISK DISCLOSURE</h3>
              <div className="text-left space-y-4 text-sm">
                <p className="font-semibold">
                  TRADING AND INVESTING IN FINANCIAL MARKETS INVOLVES SUBSTANTIAL RISK OF LOSS AND IS NOT SUITABLE FOR
                  ALL INVESTORS.
                </p>
                <p>
                  The educational content provided by Nexural Trading is for informational and educational purposes
                  only. We do not provide investment advice, recommendations, or guarantees of any kind. All analysis,
                  commentary, and educational materials are based on historical data and theoretical models that may not
                  reflect future market conditions.
                </p>
                <p>
                  <strong>YOU ACKNOWLEDGE AND AGREE THAT:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You are solely responsible for your investment decisions</li>
                  <li>You understand the risks involved in trading and investing</li>
                  <li>You will not hold Nexural Trading liable for any losses</li>
                  <li>You will consult with qualified professionals before investing</li>
                  <li>You will only invest money you can afford to lose</li>
                </ul>
                <p className="font-semibold text-red-600">
                  By using our educational platform, you acknowledge that you have read, understood, and agree to these
                  terms and disclaimers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
