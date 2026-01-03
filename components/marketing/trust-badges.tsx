"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const CancelIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const LockIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
)

const EyeOffIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
)

const CreditCardIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
)

interface TrustBadge {
  id: string
  icon: React.ComponentType
  title: string
  description: string
  color: string
}

const badges: TrustBadge[] = [
  {
    id: "ssl",
    icon: ShieldIcon,
    title: "SSL Secure",
    description: "Bank-level 256-bit encryption protects all your data",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "free",
    icon: ShieldIcon,
    title: "100% FREE",
    description: "No payments, no subscriptions, no credit card required",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "encryption",
    icon: LockIcon,
    title: "Data Encryption",
    description: "Your personal information is encrypted and never shared",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "privacy",
    icon: EyeOffIcon,
    title: "Member Privacy",
    description: "Your learning activity remains completely private",
    color: "from-orange-500 to-red-600",
  },
]

interface TrustBadgesProps {
  variant?: "footer" | "inline" | "grid"
  showTitle?: boolean
}

export function TrustBadges({ variant = "inline", showTitle = true }: TrustBadgesProps) {
  if (variant === "footer") {
    // Compact footer version
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 py-8">
        {badges.map((badge, index) => {
          const Icon = badge.icon
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 group cursor-help"
              title={badge.description}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${badge.color} p-2 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {badge.title}
              </span>
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (variant === "grid") {
    // Full grid version with descriptions
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your <span className="text-cyan-400">Security</span> & Privacy Matter
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We take your trust seriously. Here's how we protect you and your data.
              </p>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge, index) => {
              const Icon = badge.icon
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 h-full bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${badge.color} p-3 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{badge.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Trust Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Card className="p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <ShieldIcon />
                <h3 className="text-2xl font-bold text-cyan-400">Our Commitment</h3>
              </div>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We've built Nexural Trading with security and privacy at its core. Your data is encrypted, 
                your payments are secure, and your trading activity remains private. We earn your trust 
                every single day by protecting what matters most to you.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    )
  }

  // Inline version (default)
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 py-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-2 group cursor-help"
            title={badge.description}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${badge.color} p-2.5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
              <Icon />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
              {badge.title}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
