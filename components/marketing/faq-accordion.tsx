"use client"

import { useState } from "react"
import { ChevronDown, Rocket, Users, Zap, Headphones } from "lucide-react"
import { Card } from "@/components/ui/card"

const faqCategories = [
  {
    title: "Getting Started",
    icon: Rocket,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    hoverBorder: "hover:border-green-500/40",
    questions: [
      {
        question: "What is Nexural Trading?",
        answer:
          "Nexural Trading is a FREE wealth-building education community focused on the proven 80/20 system: allocate 80% to strategic long-term investing and 20% to active trading education. We provide full Discord access, YouTube educational content, free trading indicators, weekly market analysis, and a supportive learning community—all completely free forever."
      },
      {
        question: "Is it really 100% FREE?",
        answer:
          "Yes! Our community & education platform is completely FREE forever with no hidden fees, no trials, and no credit card required. You get instant access to our Discord community, entire YouTube educational library, free trading indicators, weekly market picks, portfolio reviews, and live Q&A sessions. We make money from our future OrderFlow Pro platform, not from gatekeeping education."
      },
      {
        question: "What's included in the FREE community?",
        answer:
          "Full Discord community access with real-time discussions, complete YouTube educational content library covering the 80/20 system, free trading indicators and tools, weekly market analysis and stock picks, portfolio reviews and feedback, live Q&A sessions with analysts, risk management training, trading psychology education, and 24/7 community support. Everything you need to start learning wealth building."
      },
      {
        question: "Do I need a credit card to join?",
        answer:
          "No! Simply sign up with your email and you'll get instant access to everything. No credit card, no payment info, no trials—just FREE education forever. We believe financial education should be accessible to everyone."
      },
      {
        question: "How do I get started?",
        answer:
          "Click 'Join FREE Now' on any page, sign up with your email, and you'll receive instant access to our Discord community and YouTube library. Join the Discord, introduce yourself, and start learning the 80/20 wealth building system today!"
      }
    ]
  },
  {
    title: "Community & Learning",
    icon: Users,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/40",
    questions: [
      {
        question: "What can I learn in the Discord community?",
        answer:
          "Our Discord community teaches the 80/20 wealth building system: strategic long-term investing (80%) combined with active trading education (20%). You'll learn fundamental analysis, technical indicators, risk management, portfolio allocation strategies, market psychology, and how to make informed investment decisions. Plus, you get real-time discussions with active members learning together."
      },
      {
        question: "What YouTube content do you offer?",
        answer:
          "Our YouTube library includes comprehensive courses on the 80/20 system, weekly market analysis videos, trading strategy tutorials, technical indicator guides, risk management lessons, portfolio building strategies, and market psychology training. All content is educational and designed to build your understanding of systematic wealth building from beginner to advanced levels."
      },
      {
        question: "How often do you post new content?",
        answer:
          "We post weekly market analysis and stock picks in Discord, regular YouTube videos covering trading education and market updates, daily discussions in the community, and live Q&A sessions. The community is active 24/7 with members sharing insights and learning together."
      },
      {
        question: "Can I ask questions and get help?",
        answer:
          "Absolutely! Our Discord community is built for learning. Ask questions anytime, participate in live Q&A sessions with analysts, get feedback on your portfolio and strategies, and learn from other members' experiences. We maintain a supportive, educational environment focused on helping everyone succeed."
      },
      {
        question: "What is the 80/20 wealth building system?",
        answer:
          "The 80/20 system is our proven approach to building lasting wealth: allocate 80% of your capital to strategic long-term investments (stocks, ETFs, index funds) for steady wealth building, and 20% to active trading education to accelerate growth. This balanced approach combines the stability of long-term investing with the learning opportunities of active trading—all taught for FREE in our community."
      }
    ]
  },
  {
    title: "OrderFlow Pro Platform",
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/40",
    questions: [
      {
        question: "What is OrderFlow Pro?",
        answer:
          "OrderFlow Pro is our upcoming professional-grade automation platform launching in Q3 2026. It will provide real-time options orderflow data, AI-powered stock scanning, institutional money flow tracking, unusual options activity alerts, advanced technical indicators, professional analytics dashboard, and API access. It's designed for traders who want automation beyond education."
      },
      {
        question: "When will OrderFlow Pro launch?",
        answer:
          "OrderFlow Pro is scheduled to launch in Q3 2026 (approximately 18+ months from now). We're building a robust platform with advanced features, and we want to get it right. You can join the waitlist now to be notified when we launch and receive early-bird pricing."
      },
      {
        question: "How much will OrderFlow Pro cost?",
        answer:
          "OrderFlow Pro will be $100 per month when it launches. This is a professional-grade platform with real-time data feeds, advanced AI scanning, and institutional-level analytics. All FREE community members will have priority access to upgrade when it launches, but there's never any obligation—the FREE community will always remain 100% free."
      },
      {
        question: "What features does OrderFlow Pro include?",
        answer:
          "OrderFlow Pro includes everything in the FREE community PLUS: real-time options orderflow data with volume analysis, professional AI-powered stock scanner detecting growth opportunities, institutional money flow tracking to follow smart money, unusual options activity alerts for significant trades, custom screening criteria and filters, advanced backtesting tools, professional-grade analytics dashboard, API access for custom integrations, and priority support. It's built for serious traders who want automation."
      },
      {
        question: "Can I upgrade from FREE to Pro later?",
        answer:
          "Absolutely! All FREE community members will have priority access to upgrade to OrderFlow Pro when it launches. There's no obligation to upgrade—you can stay on the FREE community plan forever. The educational content and community will never be taken away. OrderFlow Pro is for those who want advanced automation and professional-grade tools."
      }
    ]
  },
  {
    title: "Technical & Support",
    icon: Headphones,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    questions: [
      {
        question: "How do I access the Discord community?",
        answer:
          "After signing up, you'll receive an email with your Discord invitation link. Click the link, create your Discord account (if you don't have one), and you'll be instantly added to our community. If you need help, contact support@nexuraltrading.com and we'll assist you."
      },
      {
        question: "Is my data secure and private?",
        answer:
          "Yes, we take security seriously. Your email and personal information are encrypted and never shared with third parties. We use industry-standard SSL encryption, secure authentication, and follow strict privacy policies. Your trading activity and learning progress are private. We're GDPR compliant and respect your privacy."
      },
      {
        question: "Can I cancel anytime?",
        answer:
          "Since the FREE community is 100% free forever, there's nothing to cancel! You can leave anytime with no fees or penalties. If you later upgrade to OrderFlow Pro when it launches, you'll be able to cancel that subscription anytime—but your FREE community access will always remain available."
      },
      {
        question: "Do you offer refunds?",
        answer:
          "Since the FREE community is completely free, no refunds are needed or applicable. When OrderFlow Pro launches at $100/month, we'll have a clear refund policy outlined at that time. But for now, everything is FREE with no risk!"
      },
      {
        question: "How do I contact support?",
        answer:
          "For support, email us at support@nexuraltrading.com or ask questions directly in our Discord community where staff and experienced members can help. We typically respond within 24 hours. For urgent issues, mention @support in Discord for faster assistance."
      }
    ]
  }
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  categoryColor: string
}

const FAQItem = ({ question, answer, isOpen, onToggle, categoryColor }: FAQItemProps) => {
  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        isOpen
          ? `${categoryColor.replace('text-', 'border-')}/50 bg-gradient-to-br ${categoryColor.replace('text-', 'from-')}/10 to-transparent shadow-lg`
          : "border-white/10 bg-card/30 hover:border-white/20"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 group"
      >
        <h3 className={`font-semibold text-lg transition-colors ${isOpen ? categoryColor : "text-foreground group-hover:text-cyan-400"}`}>
          {question}
        </h3>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
            isOpen ? `rotate-180 ${categoryColor}` : "text-muted-foreground group-hover:text-cyan-400"
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2">
          <div className="pt-4 border-t border-white/10">
            <p className="text-muted-foreground leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function FAQAccordion() {
  const [openItems, setOpenItems] = useState<{ [key: number]: number | null }>({})

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [categoryIndex]: prev[categoryIndex] === questionIndex ? null : questionIndex,
    }))
  }

  return (
    <section className="w-full py-20 px-5 relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.03),transparent_50%)]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {faqCategories.map((category, categoryIndex) => {
          const IconComponent = category.icon
          return (
            <div key={categoryIndex} className="mb-16 last:mb-0">
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-xl ${category.bgColor} border ${category.borderColor}`}>
                  <IconComponent className={`w-6 h-6 ${category.color}`} />
                </div>
                <h2 className="text-3xl font-bold">
                  <span className={category.color}>{category.title}</span>
                </h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => (
                  <FAQItem
                    key={questionIndex}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openItems[categoryIndex] === questionIndex}
                    onToggle={() => toggleItem(categoryIndex, questionIndex)}
                    categoryColor={category.color}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
