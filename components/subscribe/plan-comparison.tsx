"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Zap } from "lucide-react"

const plans = [
  {
    name: "basic",
    displayName: "Nexural Pro",
    price: 30,
    description: "Complete access to Nexural's trading community and insights",
    features: [
      "Weekly market analysis & newsletter",
      "Premium trading signals",
      "Discord community access",
      "Educational resources & guides",
      "Live trading discussions",
      "Risk management strategies",
      "Market trend analysis",
      "Priority support",
    ],
    popular: true,
    stripePriceId: "price_PLACEHOLDER_NEED_ACTUAL_PRICE_ID",
  },
]

interface PlanComparisonProps {
  selectedPlan: string
  onPlanSelect: (planName: string) => void
}

export function PlanComparison({ selectedPlan, onPlanSelect }: PlanComparisonProps) {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 text-lg">All plans include our proven 80/20 strategy and community access</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
              plan.popular
                ? "border-teal-500 bg-gradient-to-b from-teal-500/10 to-transparent"
                : "border-gray-800 bg-gray-900/50"
            } ${selectedPlan === plan.name ? "ring-2 ring-teal-500" : ""}`}
            onClick={() => onPlanSelect(plan.name)}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-500 text-black">
                <Star className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.displayName}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full ${
                plan.popular ? "bg-teal-500 hover:bg-teal-600 text-black" : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
              onClick={() => onPlanSelect(plan.name)}
            >
              {selectedPlan === plan.name ? "Selected" : "Select Plan"}
              {plan.popular && <Zap className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export { plans }
