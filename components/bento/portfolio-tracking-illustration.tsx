import { TrendingUp } from "lucide-react"

export default function PortfolioTrackingIllustration({ isHovered = false }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg relative overflow-hidden">
      {/* Animated background elements */}
      {isHovered && (
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-float"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: "3s",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm">
        {/* Portfolio Dashboard */}
        <div
          className={`
          bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm transition-all duration-500
          ${isHovered ? "bg-gray-900/70 shadow-lg shadow-purple-500/20" : ""}
        `}
        >
          <div className="text-center mb-3">
            <div
              className={`
              text-2xl font-bold text-green-400 transition-all duration-500
              ${isHovered ? "text-green-300 scale-110" : ""}
            `}
            >
              $127,543
            </div>
            <div
              className={`
              text-xs text-gray-400 transition-all duration-300
              ${isHovered ? "text-purple-300" : ""}
            `}
            >
              Portfolio Value
            </div>
            <div
              className={`
              text-sm text-green-400 transition-all duration-300
              ${isHovered ? "text-green-300 animate-pulse" : ""}
            `}
            >
              +23.4% This Month
            </div>
          </div>

          {/* Enhanced Portfolio Breakdown with animated bars */}
          <div className="space-y-2">
            {[
              { label: "Stocks", percentage: 78, color: "bg-green-500" },
              { label: "Options", percentage: 15, color: "bg-blue-500" },
              { label: "Cash", percentage: 7, color: "bg-gray-500" },
            ].map((item, i) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span
                    className={`
                    text-gray-300 transition-all duration-300
                    ${isHovered ? "text-purple-200" : ""}
                  `}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`
                    text-white transition-all duration-300
                    ${isHovered ? "text-purple-100" : ""}
                  `}
                  >
                    {item.percentage}%
                  </span>
                </div>
                {/* Animated progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`
                      ${item.color} h-1.5 rounded-full transition-all duration-1000 ease-out
                      ${isHovered ? "shadow-sm" : ""}
                    `}
                    style={{
                      width: isHovered ? `${item.percentage}%` : "0%",
                      transitionDelay: `${i * 200}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Performance indicator */}
          {isHovered && (
            <div className="mt-3 text-center">
              <div className="text-xs text-green-400 animate-fadeIn flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Outperforming S&P 500 by 8.7%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
