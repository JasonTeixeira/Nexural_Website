"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, BookOpen, Users, Code, Gift, Target, Clock, AlertTriangle } from "lucide-react"
import Image from "next/image"

export function HowItWorksSection() {
  return (
    <section className="px-6 py-24 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <Badge variant="secondary" className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/20">
          Real Results
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
          See How Our Strategy <span className="text-teal-400">Actually Works</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
          These are real screenshots from my actual trading accounts. No fake numbers, no marketing tricks - just
          transparent results from following my AI-powered analysis and disciplined execution.
        </p>
      </div>

      {/* Real Account Performance */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <Card className="p-8 bg-gradient-to-br from-green-500/5 to-teal-500/5 border-green-500/20">
          <div className="mb-6">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-4">Investment Account</Badge>
            <h3 className="text-2xl font-bold mb-2">+81.67% Year to Date for 2025</h3>
            <p className="text-muted-foreground mb-4">
              Long-term investing strategy focused on growth stocks and market opportunities identified through our AI
              screening process.
            </p>
            <div className="flex items-center text-sm text-green-400 mb-4">
              <Target className="w-4 h-4 mr-2" />
              <span>Target: 15-25% annual returns with managed drawdowns</span>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="/account-performance-mobile.jpg"
              alt="Investment account showing 81.67% year to date returns"
              width={400}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
          <div className="mb-6">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4">Options Trading Account</Badge>
            <h3 className="text-2xl font-bold mb-2">One Account $51,915 Portfolio Value 2025</h3>
            <p className="text-muted-foreground mb-4">
              Active options and futures trading using tastytrade platform with our systematic approach to premium
              collection and directional plays.
            </p>
            <div className="flex items-center text-sm text-blue-400 mb-4">
              <Clock className="w-4 h-4 mr-2" />
              <span>Avg hold time: 7-45 days | Win rate: ~70%</span>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="/options-trading-desktop.png"
              alt="Options trading account showing portfolio performance"
              width={600}
              height={200}
              className="w-full h-auto"
            />
          </div>
        </Card>
      </div>

      {/* What You Get Section */}
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold mb-6">
          Exactly What You Get as a <span className="text-teal-400">Member</span>
        </h3>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          My strategy combines systematic long-term wealth building with strategic short-term opportunities
        </p>
      </div>

      {/* Strategy Breakdown */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card className="p-8 bg-gradient-to-br from-teal-500/5 to-green-500/5 border-teal-500/20">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">80% Long-Term Investing</h4>
              <p className="text-teal-400 font-semibold">Wealth Building Focus</p>
            </div>
          </div>
          <div className="mb-6">
            <h5 className="font-semibold mb-3 text-teal-400">Entry Criteria:</h5>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• RSI below 40 on weekly charts</li>
              <li>• Revenue growth &gt;15% YoY</li>
              <li>• P/E ratio below sector average</li>
              <li>• Strong institutional buying</li>
            </ul>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-teal-400 mt-2 mr-3 flex-shrink-0"></div>
              AI-screened growth stocks with strong fundamentals
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-teal-400 mt-2 mr-3 flex-shrink-0"></div>
              Dividend aristocrats for stability (JNJ, PG, KO)
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-teal-400 mt-2 mr-3 flex-shrink-0"></div>
              Sector rotation based on economic cycles
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-teal-400 mt-2 mr-3 flex-shrink-0"></div>
              Position sizing: 2-5% per stock, max 10% per sector
            </li>
          </ul>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">20% Active Trading</h4>
              <p className="text-orange-400 font-semibold">Futures & Options</p>
            </div>
          </div>
          <div className="mb-6">
            <h5 className="font-semibold mb-3 text-orange-400">Trade Setup:</h5>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• 30-45 DTE options for premium decay</li>
              <li>• /ES futures for index exposure</li>
              <li>• 2% max risk per trade</li>
              <li>• 50% profit target, 25% stop loss</li>
            </ul>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 mr-3 flex-shrink-0"></div>
              Cash-secured puts on quality stocks
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 mr-3 flex-shrink-0"></div>
              /ES, /NQ futures for momentum plays
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 mr-3 flex-shrink-0"></div>
              Iron condors during low volatility periods
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 mr-3 flex-shrink-0"></div>
              Weekly market analysis and trade alerts
            </li>
          </ul>
        </Card>
      </div>

      {/* Additional Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
          <div className="flex items-center mb-4">
            <Gift className="w-6 h-6 text-blue-400 mr-3" />
            <h4 className="text-xl font-bold">Free Indicators</h4>
          </div>
          <p className="text-muted-foreground mb-4">
            Custom TradingView indicators, Python scripts for backtesting, and proprietary screening tools.
          </p>
          <div className="text-sm text-blue-400">
            <div>• RSI divergence scanner</div>
            <div>• Volume profile analyzer</div>
            <div>• Volatility meter </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <div className="flex items-center mb-4">
            <BookOpen className="w-6 h-6 text-purple-400 mr-3" />
            <h4 className="text-xl font-bold">Continuous Education</h4>
          </div>
          <p className="text-muted-foreground mb-4">
            Weekly market analysis, strategy breakdowns, and live Q&A sessions to improve your trading skills.
          </p>
          <div className="text-sm text-purple-400">
            <div>• Weekly market outlook</div>
            <div>• Strategy deep-dives</div>
            <div>• Live trading sessions</div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-teal-500/5 border-green-500/20">
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-3">
              <Users className="w-6 h-6 text-green-400 mr-1" />
              <Code className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-xl font-bold">Community Projects</h4>
          </div>
          <p className="text-muted-foreground mb-4">
            Collaborate on Python trading scripts, share TradingView strategies, and access our GitHub repository with
            backtesting tools.
          </p>
          <div className="text-sm text-green-400">
            <div>• Python backtesting framework</div>
            <div>• Shared strategy repository</div>
            <div>• Code review sessions</div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h5 className="font-semibold text-yellow-400 mb-2">Important Disclaimer</h5>
            <p className="text-sm text-muted-foreground">
              Past performance does not guarantee future results. All trading involves risk of loss. The strategies
              shown are for educational purposes and should not be considered personalized investment advice. Always
              consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
