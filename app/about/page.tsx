import { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, Target, Users, Award, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Nexural Trading',
  description: 'Learn about Nexural Trading - Our mission to democratize professional trading through AI-powered tools and education',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Nexural Trading
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Empowering traders with AI-powered insights, professional tools, 
              and a thriving community built on education and transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6 text-center">
              To democratize professional-grade trading tools and education, making sophisticated 
              market analysis accessible to everyone—from beginners to experienced traders.
            </p>
            <p className="text-lg text-muted-foreground text-center">
              We believe that with the right tools, education, and community support, 
              anyone can develop the skills needed to navigate financial markets confidently.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Meet the Founder</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-1 flex justify-center items-start">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl">
                    <img 
                      src="/sage-founder.jpg" 
                      alt="Sage, Founder of Nexural Trading" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-xl group-hover:blur-2xl transition-all duration-500 -z-10"></div>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Sage</h3>
                  <p className="text-cyan-400 font-semibold">Founder & Lead Developer</p>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <p className="text-lg leading-relaxed">
                    After years of navigating the trading education industry, I noticed a disturbing pattern: 
                    expensive courses making impossible promises, "gurus" charging $997/month for mediocre signals, 
                    and genuinely helpful tools locked behind ridiculous paywalls.
                  </p>
                  <p className="text-lg leading-relaxed">
                    As both a developer and active trader, I decided to build something different. Nexural Trading 
                    started as my personal toolset—combining algorithmic analysis with the 80/20 principle I'd learned 
                    from years of real trading experience.
                  </p>
                  <p className="text-lg leading-relaxed">
                    What began as tools for myself evolved into a community. Today, our FREE Discord brings together 
                    traders who value education over hype, data over emotion, and community over competition.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 rounded-lg p-6 border border-border">
              <h3 className="text-xl font-semibold mb-4">Why I Built This (And Why It's Free)</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Discord community is—and always will be—<span className="text-green-400 font-semibold">100% FREE</span>. 
                  No trials, no credit cards, no catches. Here's why:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Community Over Revenue:</strong> A diverse, active community creates more value than any 
                    subscription fee ever could. When traders learn together, everyone wins.
                  </li>
                  <li>
                    <strong>Democratizing Trading Education:</strong> Professional-grade tools shouldn't be reserved 
                    for those who can afford $500+/month services. Education should be accessible.
                  </li>
                  <li>
                    <strong>Building Trust First:</strong> I'd rather you experience real value before ever 
                    considering paid products. Our future research platform will be an optional upgrade—
                    the community remains free forever.
                  </li>
                </ul>
                <p className="text-lg font-semibold text-cyan-300 pt-4">
                  Join for the free tools. Stay for the community. Upgrade only if the advanced platform 
                  makes sense for your trading style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                No hidden fees, no misleading claims. We show you exactly what you're getting 
                and how our tools work. Our track record is real, not fabricated.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community First</h3>
              <p className="text-muted-foreground">
                We're not just a service—we're a community. Share insights, learn from others, 
                and grow together in our Discord with like-minded traders.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Education</h3>
              <p className="text-muted-foreground">
                We don't just give you signals—we teach you why they work. Understand the logic, 
                develop your skills, and become a better trader.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Results-Driven</h3>
              <p className="text-muted-foreground">
                Every feature we build is designed to provide real value. We focus on what works, 
                backed by data and proven methodologies.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                We leverage cutting-edge AI and machine learning to stay ahead of the curve, 
                constantly improving our models and tools.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrity</h3>
              <p className="text-muted-foreground">
                We only promote what we believe in. No affiliate schemes, no pump-and-dump. 
                Your success is our success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">What Makes Us Different</h2>
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">1. Real AI, Not Marketing Hype</h3>
                <p className="text-muted-foreground">
                  Our ML models are built by engineers with real experience in quantitative trading. 
                  We use proven techniques like XGBoost, ensemble learning, and advanced feature engineering—not 
                  just buzzwords.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">2. Honest Performance Metrics</h3>
                <p className="text-muted-foreground">
                  We report edge percentages, Sharpe ratios, and drawdowns—the metrics professionals actually use. 
                  No cherry-picked winners or misleading win rates.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">3. Completely FREE</h3>
                <p className="text-muted-foreground">
                  Professional trading tools shouldn't be locked behind paywalls. We provide everything 100% FREE—
                  no credit card, no trials, no hidden fees. Just instant access to our entire community and tools.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">4. Community-Driven Development</h3>
                <p className="text-muted-foreground">
                  We listen to our members. Feature requests, feedback, and suggestions directly shape our roadmap. 
                  You're not just a subscriber—you're part of the team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Approach to Trading</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                <strong>We're Systematic, Not Emotional:</strong> Our signals are generated by algorithms, 
                not gut feelings. This removes emotion and bias from the equation.
              </p>
              <p>
                <strong>We Focus on Edge, Not Perfection:</strong> No system wins 100% of the time. 
                We aim for a consistent statistical edge over many trades—that's what matters.
              </p>
              <p>
                <strong>We Trade What We Signal:</strong> We eat our own cooking. The signals you get 
                are the same ones we use in our own trading.
              </p>
              <p>
                <strong>We Emphasize Risk Management:</strong> Position sizing, stop losses, and portfolio 
                diversification are just as important as signal generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">7.0%</div>
              <div className="text-sm text-muted-foreground">Statistical Edge (ES)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">1.4-1.8</div>
              <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">FREE</div>
              <div className="text-sm text-muted-foreground">Forever</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Discord Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our FREE Community?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our FREE Discord community today. Full access. No credit card required. Forever.
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
              href="/indicators"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-bold rounded-xl transition-all"
            >
              View Free Indicators
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
