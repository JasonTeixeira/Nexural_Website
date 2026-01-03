"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const QuestionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

interface FAQItem {
  id: string
  question: string
  answer: string
  category: "general" | "pricing" | "technical" | "trading"
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "Is this really 100% free?",
    answer:
      "Yes! You get complete FREE access to our 80/20 wealth building educational system: daily market analysis, live Discord community with 1000+ active learners, educational resources, risk management principles, and systematic trading education. No payment required, no credit card needed, no hidden fees.",
    category: "pricing",
  },
  {
    id: "2",
    question: "Is this suitable for beginners?",
    answer:
      "Absolutely! Our 80/20 system is designed for all levels. We focus 80% on long-term strategic investing education (perfect for beginners) and 20% on day trading education (for those ready to learn). You'll get step-by-step guidance, educational content, and a supportive community to help you every step of the way.",
    category: "general",
  },
  {
    id: "3",
    question: "How is this different from other trading education?",
    answer:
      "We provide FREE access to institutional-grade education combined with 14 years of systematic trading experience. You're learning the complete system: the 'why' behind trading decisions, risk management strategies, and joining a community of active learners. Plus, our founder is both a developer and trader, so you learn from real experience.",
    category: "general",
  },
  {
    id: "4",
    question: "Do I need to provide payment information?",
    answer:
      "No! There are no payments, subscriptions, or trials. Simply join our FREE Discord community and start learning immediately. Everything is provided at no cost with no future payment obligations.",
    category: "pricing",
  },
  {
    id: "5",
    question: "What can I learn from the community?",
    answer:
      "Our FREE community focuses on education and building knowledge. You'll learn the 80/20 investment strategy, market analysis fundamentals, risk management principles, and systematic trading approaches. We emphasize learning and understanding over making specific promises about returns.",
    category: "trading",
  },
  {
    id: "6",
    question: "Do I need a lot of money to practice what I learn?",
    answer:
      "No! You can start learning and paper trading with no money at all. When you're ready to invest real capital, our educational focus on proper position sizing and risk management helps you start with any amount you're comfortable with.",
    category: "trading",
  },
  {
    id: "7",
    question: "How much time do I need to dedicate?",
    answer:
      "That's completely up to you! Our educational content is available 24/7 in the FREE Discord community. Spend as much or as little time as you want learning. Many members check in for 30 minutes daily, while others prefer weekly deep dives. Learn at your own pace.",
    category: "general",
  },
]

export function FAQAccordionInline() {
  const [openItem, setOpenItem] = useState<string | null>("1")
  const [searchQuery, setSearchQuery] = useState("")
  const [discordMembers, setDiscordMembers] = useState<number | null>(null)

  useEffect(() => {
    async function fetchDiscordMembers() {
      try {
        const response = await fetch('/api/discord/member-count')
        const data = await response.json()
        setDiscordMembers(data.memberCount || 0)
      } catch (error) {
        console.error('Error fetching Discord members:', error)
      }
    }
    fetchDiscordMembers()
  }, [])

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            Got Questions?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Frequently Asked
            </span>{" "}
            Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Nexural Trading
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <QuestionIcon />
            </div>
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {filteredFAQs.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50 hover:border-cyan-500/30 transition-all duration-300">
                <button
                  onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                      <QuestionIcon />
                    </div>
                    <span className="text-lg font-semibold text-foreground group-hover:text-cyan-400 transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: openItem === item.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 ml-4"
                  >
                    <ChevronDownIcon />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openItem === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-[72px]">
                        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground mb-4">No questions found matching your search.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Clear search
            </button>
          </motion.div>
        )}

        {/* View All FAQs Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors group"
            >
              View All FAQs
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-muted-foreground">or</span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 rounded-lg text-cyan-400 font-medium transition-all"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Discord Members", value: discordMembers ? discordMembers.toLocaleString() : "..." },
            { label: "FREE Access", value: "100%" },
            { label: "Community Support", value: "24/7" },
            { label: "Educational Content", value: "Daily" },
          ].map((stat, index) => (
            <Card
              key={index}
              className="p-4 text-center bg-gradient-to-br from-card/30 to-card/10 backdrop-blur-sm border-border/30"
            >
              <div className="text-2xl font-bold text-cyan-400 mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
