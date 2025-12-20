import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Nexural Trading',
  description: 'Find answers to common questions about Nexural Trading - Pricing, features, trading signals, and more',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about Nexural Trading
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-lg p-6 border border-border mb-12">
          <h2 className="text-lg font-semibold mb-4">Jump to Section:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a href="#getting-started" className="text-cyan-400 hover:text-cyan-300">→ Getting Started</a>
            <a href="#pricing" className="text-cyan-400 hover:text-cyan-300">→ Community Access</a>
            <a href="#features" className="text-cyan-400 hover:text-cyan-300">→ Features & Tools</a>
            <a href="#trading" className="text-cyan-400 hover:text-cyan-300">→ Trading Signals</a>
            <a href="#technical" className="text-cyan-400 hover:text-cyan-300">→ Technical Support</a>
            <a href="#account" className="text-cyan-400 hover:text-cyan-300">→ Account & Security</a>
          </div>
        </div>

        {/* Getting Started */}
        <section id="getting-started" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Getting Started</h2>
          
          <div className="space-y-6">
            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">What is Nexural Trading?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Nexural Trading is an educational platform that provides AI-powered trading signals, 
                  market analysis, and a community of traders. We offer professional-grade tools 100% FREE—
                  no credit card, no trials, no limits. Forever.
                </p>
                <p>
                  We're NOT financial advisors—we provide educational resources and tools to help you 
                  develop your own trading skills.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">How do I get started?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Join our FREE Discord community at https://discord.gg/fTS3Nedk</li>
                  <li>Explore all channels and connect with traders</li>
                  <li>Access our member portal and all features</li>
                  <li>Get trading signals and exclusive educational content</li>
                  <li>Start learning and trading with our tools—all FREE forever</li>
                </ol>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Do I need trading experience?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Our platform is designed for all skill levels:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Beginners:</strong> We provide educational content to learn the basics</li>
                  <li><strong>Intermediate:</strong> Improve your skills with our analysis and signals</li>
                  <li><strong>Advanced:</strong> Use our tools to validate your own strategies</li>
                </ul>
                <p className="mt-4">
                  That said, we recommend understanding basic trading concepts before risking real money.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Is there a free trial?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Everything is FREE! Our Discord community gives you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full access to all channels and content</li>
                  <li>Trading signals and market analysis</li>
                  <li>Educational resources and guides</li>
                  <li>Community support from traders worldwide</li>
                  <li>No credit card required, ever</li>
                </ul>
                <p className="mt-4">
                  Join instantly at https://discord.gg/fTS3Nedk
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Community Access */}
        <section id="pricing" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Community Access</h2>
          
          <div className="space-y-6">
            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">How much does it cost?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="font-semibold mb-2 text-green-400">100% FREE - Forever:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Full Discord community access</li>
                      <li>AI-powered trading signals</li>
                      <li>Member portal access</li>
                      <li>All educational content</li>
                      <li>Trading tools and indicators</li>
                      <li>24/7 community support</li>
                      <li>No credit card required</li>
                      <li>No trials or limits</li>
                    </ul>
                  </div>
                  <p className="text-lg font-semibold text-center text-cyan-300">
                    Everything. FREE. Forever. Join at https://discord.gg/fTS3Nedk
                  </p>
                </div>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Do I need a credit card?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4 text-lg font-semibold text-green-400">
                  NO! Absolutely not.
                </p>
                <p className="mb-4">
                  Everything is 100% free. You just need:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A Discord account (free to create)</li>
                  <li>Click our invite link: https://discord.gg/fTS3Nedk</li>
                  <li>That's it! Instant full access to everything</li>
                </ul>
                <p className="mt-4 font-semibold">
                  No payment info. No trials. No catches. Just free, forever.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Can I leave anytime?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Absolutely! Since everything is free, you can:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Leave Discord anytime (you're always welcome back)</li>
                  <li>Take breaks whenever you need</li>
                  <li>No commitments or obligations</li>
                  <li>No cancellation process needed</li>
                </ul>
                <p className="mt-4">
                  We're a community, not a subscription. Come and go as you please!
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Why is everything free?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  We believe trading education and tools shouldn't be locked behind paywalls.
                </p>
                <p className="mb-4">
                  Our mission is to democratize professional-grade trading resources. By making 
                  everything free, we build a stronger, more diverse community where everyone can learn 
                  and grow together.
                </p>
                <p className="font-semibold text-cyan-300">
                  No ads. No upsells. No hidden fees. Just a genuine trading community.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Features & Tools */}
        <section id="features" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Features & Tools</h2>
          
          <div className="space-y-6">
            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">What trading signals do you provide?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  We provide AI-powered signals for futures markets:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>ES (E-mini S&P 500):</strong> 7.0% statistical edge</li>
                  <li><strong>RTY (E-mini Russell 2000):</strong> 5.8% edge</li>
                  <li><strong>YM (E-mini Dow):</strong> 5.2% edge</li>
                  <li><strong>NQ (E-mini Nasdaq):</strong> 4.4% edge</li>
                </ul>
                <p className="mb-4">
                  Signals include entry levels, targets, stop losses, and confidence scores.
                </p>
                <p className="font-semibold text-yellow-600 dark:text-yellow-500">
                  Remember: These are educational signals, not financial advice. Trade at your own risk.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">How accurate are your signals?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  We focus on <strong>edge</strong>, not win rate:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Accuracy: 55-57% (slightly better than coin flip)</li>
                  <li>Edge: 5-7% (what really matters)</li>
                  <li>Sharpe Ratio: 1.4-1.8 (risk-adjusted returns)</li>
                </ul>
                <p className="mb-4">
                  Our models win slightly more than they lose, with controlled risk management. 
                  This consistent edge compounds over many trades.
                </p>
                <p className="font-semibold">
                  Past performance doesn't guarantee future results. Markets change constantly.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Can I use these signals for automated trading?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Not currently. Our signals are delivered via Discord and the member portal for 
                  manual review and execution.
                </p>
                <p className="mb-4">
                  We recommend manual trading because:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You learn and understand each trade</li>
                  <li>You can adjust for market conditions</li>
                  <li>You maintain control and flexibility</li>
                </ul>
                <p className="mt-4">
                  Automated trading may be available in OrderFlow Pro (coming soon).
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">What's included in the member portal?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Real-time trading signals dashboard</li>
                  <li>Performance analytics and metrics</li>
                  <li>Educational content and guides</li>
                  <li>Account management and settings</li>
                  <li>Referral program (earn free months)</li>
                </ul>
              </div>
            </details>
          </div>
        </section>

        {/* Trading Signals */}
        <section id="trading" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Trading Signals</h2>
          
          <div className="space-y-6">
            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">How often do you post signals?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Signal frequency varies by market conditions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Typical:</strong> 2-5 signals per day per ticker</li>
                  <li><strong>Volatile days:</strong> More opportunities (5-10 signals)</li>
                  <li><strong>Quiet days:</strong> Fewer signals (0-2 signals)</li>
                </ul>
                <p className="mt-4">
                  We only signal when our models identify high-probability setups. 
                  Quality over quantity.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Do I need to take every signal?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Absolutely not! You should:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Choose tickers that fit your style and capital</li>
                  <li>Consider your risk tolerance</li>
                  <li>Only trade when you can monitor positions</li>
                  <li>Skip signals that don't align with your analysis</li>
                </ul>
                <p className="mt-4 font-semibold">
                  Our signals are suggestions, not commands. You decide what to trade.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">What markets/instruments do you cover?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Currently, we focus on futures:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>ES - E-mini S&P 500</li>
                  <li>NQ - E-mini Nasdaq-100</li>
                  <li>RTY - E-mini Russell 2000</li>
                  <li>YM - E-mini Dow</li>
                </ul>
                <p>
                  We're expanding to options and other instruments in future updates.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Technical Support */}
        <section id="technical" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Technical Support</h2>
          
          <div className="space-y-6">
            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">How do I get support?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Multiple support channels:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Discord:</strong> Fastest response (usually within 1 hour)</li>
                  <li><strong>Email:</strong> support@nexural.io (within 24 hours)</li>
                  <li><strong>Member Portal:</strong> Help center and documentation</li>
                </ul>
                <p>
                  For urgent issues, Discord is your best bet. Our community often helps 
                  even before we can respond!
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">I can't access my account. What do I do?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Try these steps:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Use "Forgot Password" on the login page</li>
                  <li>Check your spam folder for the reset email</li>
                  <li>Try a different browser or clear your cache</li>
                  <li>Verify you're using the correct email address</li>
                </ol>
                <p>
                  Still stuck? Email support@nexural.io with your registered email 
                  and we'll help immediately.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Do you have a mobile app?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  Not yet, but our website is fully mobile-responsive! You can:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Access the member portal from any device</li>
                  <li>View signals on your phone or tablet</li>
                  <li>Use Discord mobile app for community access</li>
                </ul>
                <p>
                  A dedicated mobile app is on our roadmap for 2026.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Account & Security */}
        <section id="account" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Account & Security</h2>
          
          <div className="space-y-6">
            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">How do you protect my data?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  We take security seriously:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption in transit (HTTPS/TLS)</li>
                  <li>Encryption at rest (database)</li>
                  <li>Secure payment processing (Stripe)</li>
                  <li>Regular security audits</li>
                  <li>No storage of credit card data</li>
                  <li>GDPR & CCPA compliant</li>
                </ul>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">Can I share my account?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  No. Accounts are for individual use only and cannot be shared.
                </p>
                <p className="mb-4">
                  Account sharing violates our Terms of Service and may result in 
                  account termination without refund.
                </p>
                <p>
                  Instead, use our referral program—you'll earn free months when friends subscribe!
                </p>
              </div>
            </details>

            <details className="bg-card rounded-lg border border-border overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center hover:bg-card/80">
                <span className="font-semibold">How do I delete my account?</span>
                <ChevronDown className="w-5 h-5" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                <p className="mb-4">
                  To delete your account:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Cancel your subscription first</li>
                  <li>Email support@nexural.io with "Delete Account" in the subject</li>
                  <li>Confirm your identity (we'll ask for your registered email)</li>
                  <li>We'll process deletion within 72 hours</li>
                </ol>
                <p className="font-semibold">
                  Account deletion is permanent and cannot be undone.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Still Have Questions */}
        <div className="bg-gradient-to-br from-cyan-500/10 via-card to-blue-500/10 rounded-lg p-8 border border-border text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.gg/fTS3Nedk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-105"
            >
              Join FREE Discord Community
            </a>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-bold rounded-xl transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
