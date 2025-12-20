import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service | Nexural Trading",
  description:
    "Comprehensive terms of service for Nexural Trading's financial trading platform and AI-powered investment tools.",
  keywords: "terms of service, legal agreement, AI trading, financial services, user agreement",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 text-primary border-primary/20">
            📋 Legal Agreement
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Please read these terms carefully before using our AI-powered financial platform
          </p>
          <p className="text-sm text-muted-foreground">Last updated: December 19, 2024</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Acceptance of Terms */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">✅ Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Nexural Trading's platform, you acknowledge that you have read, understood, and agree
                to be bound by these Terms of Service. If you do not agree to these terms, please do not use our
                services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These terms constitute a legally binding agreement between you and Nexural Trading regarding your use of our
                AI-powered financial analysis and trading platform.
              </p>
            </CardContent>
          </Card>

          {/* AI Services */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">🤖 AI Services and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Our AI-powered analysis tools are designed to assist with financial decision-making but should not be
                considered as professional financial advice.
              </p>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h4 className="font-semibold text-accent mb-2">AI Service Limitations:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• AI predictions are based on historical data and market patterns</li>
                  <li>• Results may vary and are not guaranteed</li>
                  <li>• AI recommendations should be verified independently</li>
                  <li>• System performance may be affected by market volatility</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Trading Risks */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-destructive">
                ⚠️ Trading Risks and Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-3">Important Risk Warnings:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• All trading involves substantial risk of loss</li>
                  <li>• Past performance does not guarantee future results</li>
                  <li>• You may lose more than your initial investment</li>
                  <li>• Market conditions can change rapidly and unpredictably</li>
                  <li>• Leverage trading increases both potential gains and losses</li>
                </ul>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You acknowledge that you understand these risks and that you are solely responsible for all trading
                decisions made using our platform.
              </p>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">👤 User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                As a user of our platform, you agree to the following responsibilities:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Account Security</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Maintain secure login credentials</li>
                    <li>• Report unauthorized access immediately</li>
                    <li>• Use strong, unique passwords</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Compliance</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Follow all applicable laws and regulations</li>
                    <li>• Provide accurate information</li>
                    <li>• Report suspicious activities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">🔒 Data Usage and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We collect and use your data to provide and improve our AI-powered financial services.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold text-primary mb-2">Data Collection</h4>
                  <p className="text-sm text-muted-foreground">Trading patterns, preferences, and platform usage</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-2xl mb-2">🔄</div>
                  <h4 className="font-semibold text-primary mb-2">Data Processing</h4>
                  <p className="text-sm text-muted-foreground">AI analysis, personalization, and service improvement</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-2xl mb-2">🛡️</div>
                  <h4 className="font-semibold text-primary mb-2">Data Protection</h4>
                  <p className="text-sm text-muted-foreground">Encryption, secure storage, and privacy compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">🌐 Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                While we strive to maintain continuous service availability, we cannot guarantee uninterrupted access to
                our platform.
              </p>
              <div className="bg-muted/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Service Limitations:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Scheduled maintenance windows</li>
                  <li>• Technical difficulties or system failures</li>
                  <li>• Third-party service dependencies</li>
                  <li>• Regulatory or legal requirements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">💡 Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                All content, software, and AI algorithms on our platform are protected by intellectual property rights
                and remain the property of Nexural Trading.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Our Rights</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Proprietary AI algorithms</li>
                    <li>• Platform design and functionality</li>
                    <li>• Trademarks and branding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Your Rights</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Limited license to use our services</li>
                    <li>• Ownership of your trading data</li>
                    <li>• Right to export your information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">🚪 Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Either party may terminate this agreement under certain circumstances.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">User Termination</h4>
                  <p className="text-sm text-muted-foreground">
                    You may close your account at any time through your account settings.
                  </p>
                </div>
                <div className="bg-muted/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Platform Termination</h4>
                  <p className="text-sm text-muted-foreground">
                    We may suspend or terminate accounts for violations of these terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-primary">📞 Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-2">📧</div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-muted-foreground">legal@nexural.io</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">📍</div>
                  <p className="font-semibold">Address</p>
                  <p className="text-sm text-muted-foreground">
                    123 Financial District
                    <br />
                    New York, NY 10004
                  </p>
                </div>
                <div>
                  <div className="text-2xl mb-2">⏰</div>
                  <p className="font-semibold">Business Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agreement Button */}
          <div className="text-center py-8">
            <Button size="lg" className="px-8 py-3 text-lg">
              I Agree to These Terms
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              By clicking this button, you acknowledge that you have read and agree to these Terms of Service
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
