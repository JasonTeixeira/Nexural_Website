import { TrendingUp, Shield, MessageCircle } from "lucide-react"

export default function CommunityInsightsIllustration({ isHovered = false }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500/10 to-green-500/10 rounded-lg relative overflow-hidden">
      {/* Chat bubble animations */}
      {isHovered && (
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-teal-400/30 rounded-full animate-ping"
              style={{
                right: `${10 + i * 20}%`,
                top: `${20 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm">
        {/* Discord-style Chat */}
        <div
          className={`
          bg-gray-900/50 rounded-lg p-3 backdrop-blur-sm transition-all duration-500
          ${isHovered ? "bg-gray-900/70 shadow-lg shadow-teal-500/20" : ""}
        `}
        >
          <div
            className={`
            text-xs text-gray-400 mb-2 flex items-center gap-2 transition-all duration-300
            ${isHovered ? "text-teal-300" : ""}
          `}
          >
            <div
              className={`
              w-2 h-2 bg-green-500 rounded-full transition-all duration-300
              ${isHovered ? "animate-pulse shadow-sm shadow-green-500" : ""}
            `}
            ></div>
            Trading Community • 2,547 online
          </div>

          <div className="space-y-2">
            {[
              { user: "TraderPro", message: "NVDA looking bullish on the 4H chart", icon: TrendingUp, color: "text-primary" },
              { user: "AIAnalyst", message: "New signal: TSLA breakout confirmed", icon: null, color: "text-yellow-400" },
              { user: "RiskManager", message: "Remember to set your stop losses!", icon: Shield, color: "text-green-400" },
            ].map((chat, i) => (
              <div
                key={chat.user}
                className={`
                  text-xs transition-all duration-500
                  ${isHovered ? "transform translate-x-1 opacity-100" : "opacity-80"}
                `}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <span className={`${chat.color} font-medium transition-all duration-300`}>{chat.user}:</span>
                <span
                  className={`
                  text-gray-300 ml-1 transition-all duration-300 inline-flex items-center gap-1
                  ${isHovered ? "text-teal-100" : ""}
                `}
                >
                  {chat.message}
                  {chat.icon && <chat.icon className="h-3 w-3 inline" />}
                </span>
              </div>
            ))}
          </div>

          {/* Enhanced Active Members with hover effects */}
          <div className="mt-3 flex -space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`
                  w-4 h-4 bg-gradient-to-br from-primary to-teal-400 rounded-full border border-gray-800
                  transition-all duration-300
                  ${isHovered ? "scale-110 shadow-sm shadow-teal-400/50" : ""}
                `}
                style={{ transitionDelay: `${i * 50}ms` }}
              ></div>
            ))}
            <div
              className={`
              w-4 h-4 bg-gray-700 rounded-full border border-gray-800 flex items-center justify-center
              transition-all duration-300
              ${isHovered ? "bg-gray-600 scale-110" : ""}
            `}
            >
              <span className="text-[8px] text-gray-400">+</span>
            </div>
          </div>

          {/* Live activity indicator */}
          {isHovered && (
            <div className="mt-2 text-center">
              <div className="text-xs text-teal-400 animate-fadeIn flex items-center justify-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>12 new messages in last minute</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
