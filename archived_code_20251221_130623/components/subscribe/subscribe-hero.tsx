"use client"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Shield, Users } from "lucide-react"

export function SubscribeHero() {
  return (
    <div className="text-center mb-16">
      

      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
        Start Your Trading Journey
      </h1>

      <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
        Get access to AI-powered stock analysis, proven strategies, and a community of successful traders. Choose your
        plan and start building wealth today.
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <CheckCircle className="w-6 h-6 text-teal-400" />
          <span className="text-gray-300">80% Long-term Investing</span>
        </div>
        <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <CheckCircle className="w-6 h-6 text-teal-400" />
          <span className="text-gray-300">20% Active Trading</span>
        </div>
        <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <CheckCircle className="w-6 h-6 text-teal-400" />
          <span className="text-gray-300">Free TradingView Indicators</span>
        </div>
      </div>

      
    </div>
  )
}
