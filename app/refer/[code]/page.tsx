import Link from 'next/link'
import { validateReferralCode, trackReferralClick } from '@/lib/referral/referral-utils'

export default async function ReferralLandingPage({ params }: { params: { code: string } }) {
  const { code } = params
  
  // Validate code
  const isValid = await validateReferralCode(code)
  
  if (!isValid) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Invalid Referral Code</h1>
          <p className="text-muted-foreground mb-8">
            This referral link is not valid or has expired.
          </p>
          <a
            href="https://discord.gg/fTS3Nedk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Join FREE Community
          </a>
        </div>
      </div>
    )
  }

  // Track click
  await trackReferralClick(code)

  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              You've Been Invited!
            </span>
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            A friend invited you to join Nexural Trading
          </p>
        </div>

        <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 mb-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-3 mb-6">
              <span className="text-2xl font-bold text-green-300">Great News!</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                100% FREE
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-2">Everything. Forever.</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-bold text-green-300">$0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-foreground mb-1">Live Signals</h3>
              <p className="text-sm text-muted-foreground">Real-time trade alerts</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-3xl mb-2">🎓</div>
              <h3 className="font-bold text-foreground mb-1">Education</h3>
              <p className="text-sm text-muted-foreground">Learn from pros</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-bold text-foreground mb-1">Community</h3>
              <p className="text-sm text-muted-foreground">Join 1000+ traders</p>
            </div>
          </div>

          <a
            href="https://discord.gg/fTS3Nedk"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-bold rounded-xl text-center transition-all transform hover:scale-105"
          >
            Join FREE Discord Community →
          </a>

          <p className="text-center text-sm text-muted-foreground mt-4">
            No credit card required • Instant access • Forever free
          </p>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Already have an account?
          </p>
          <Link 
            href="/login"
            className="text-cyan-300 hover:text-cyan-200 font-medium"
          >
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  )
}
