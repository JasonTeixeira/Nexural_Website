"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does your quantitative analysis differ from traditional stock picking?",
      answer:
        "Our approach combines fundamental analysis, technical indicators, and machine learning models to create a systematic, data-driven investment process. Unlike traditional methods that rely heavily on intuition or single metrics, we use ensemble models that analyze hundreds of variables simultaneously, providing more robust and consistent results.",
    },
    {
      question: "What is the role of 'Sage' in your analysis process?",
      answer:
        "Sage is our lead quantitative analyst who reviews all AI-generated recommendations before they're shared with members. This human oversight ensures that our models' outputs make sense in current market conditions and helps catch any potential algorithmic biases or errors. It's the perfect blend of artificial intelligence and human expertise.",
    },
    {
      question: "Is the community really 100% free?",
      answer:
        "Yes, absolutely! Our Discord community, educational content, and market analysis are completely free with no hidden fees, trials, or payment required. You can join, learn, and participate without ever providing payment information.",
    },
    {
      question: "How do you manage risk in your stock recommendations?",
      answer:
        "Risk management is central to our methodology. We use position sizing based on the Kelly Criterion, maintain portfolio correlation below 0.3, implement dynamic stop-losses, and continuously monitor Value at Risk (VaR). Every recommendation includes specific risk metrics and suggested position sizes based on your risk tolerance.",
    },
    {
      question: "What can I learn from the community?",
      answer:
        "Our FREE community provides education on the 80/20 investment strategy, market analysis fundamentals, technical and fundamental analysis, risk management principles, and systematic trading approaches. We focus on building your knowledge and understanding rather than making specific promises about returns.",
    },
    {
      question: "Do you provide personalized investment advice?",
      answer:
        "No, we provide educational content and general market analysis only. We do not offer personalized investment recommendations or financial advice. All content is for educational purposes, and you should consult with qualified financial advisors for personalized guidance.",
    },
    {
      question: "How often is new educational content posted?",
      answer:
        "We share daily market insights, weekly educational content, and regular community discussions in our FREE Discord. Content frequency varies based on market conditions and educational topics, but our goal is to provide consistent, valuable learning opportunities for all members.",
    },
    {
      question: "What educational background do I need to understand your analysis?",
      answer:
        "No specific background is required. Our educational program starts with fundamentals and progresses to advanced concepts. We provide explanations at multiple levels - from basic summaries for beginners to detailed mathematical models for experienced quantitative investors. Our weekly sessions help bridge any knowledge gaps.",
    },
  ]

  return (
    null
  )
}
