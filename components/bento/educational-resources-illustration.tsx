import { Trophy } from "lucide-react"

export default function EducationalResourcesIllustration({ isHovered = false }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-lg relative overflow-hidden">
      {/* Learning particles */}
      {isHovered && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/60 rounded-full animate-bounce"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm">
        {/* Learning Dashboard */}
        <div
          className={`
          bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm transition-all duration-500
          ${isHovered ? "bg-gray-900/70 shadow-lg shadow-cyan-500/20" : ""}
        `}
        >
          <div className="text-center mb-3">
            <div
              className={`
              text-lg font-bold text-primary transition-all duration-500
              ${isHovered ? "text-cyan-300 scale-105" : ""}
            `}
            >
              Trading Academy
            </div>
            <div
              className={`
              text-xs text-gray-400 transition-all duration-300
              ${isHovered ? "text-cyan-300" : ""}
            `}
            >
              Your Learning Progress
            </div>
          </div>

          {/* Enhanced Course Progress with animations */}
          <div className="space-y-3">
            {[
              { course: "Technical Analysis", progress: 85, color: "bg-green-500" },
              { course: "Risk Management", progress: 92, color: "bg-blue-500" },
              { course: "Options Trading", progress: 67, color: "bg-purple-500" },
            ].map((item, i) => (
              <div key={item.course}>
                <div className="flex justify-between text-xs mb-1">
                  <span
                    className={`
                    text-gray-300 transition-all duration-300
                    ${isHovered ? "text-cyan-200" : ""}
                  `}
                  >
                    {item.course}
                  </span>
                  <span
                    className={`
                    text-primary transition-all duration-300
                    ${isHovered ? "text-cyan-300 animate-pulse" : ""}
                  `}
                  >
                    {item.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`
                      ${item.color} h-1.5 rounded-full transition-all duration-1000 ease-out
                      ${isHovered ? "shadow-sm animate-shimmer" : ""}
                    `}
                    style={{
                      width: isHovered ? `${item.progress}%` : "0%",
                      transitionDelay: `${i * 300}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Achievement badge */}
          {isHovered && (
            <div className="mt-3 text-center">
              <div className="text-xs text-cyan-400 animate-fadeIn flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3" />
                <span>3 certificates earned this month</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
