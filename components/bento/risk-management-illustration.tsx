export default function RiskManagementIllustration({ isHovered = false }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg relative overflow-hidden">
      {/* Warning pulse effect */}
      {isHovered && (
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-yellow-400/30 rounded-full animate-ping" />
        </div>
      )}

      <div className="relative w-full max-w-sm">
        {/* Risk Meter */}
        <div
          className={`
          bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm transition-all duration-500
          ${isHovered ? "bg-gray-900/70 shadow-lg shadow-orange-500/20" : ""}
        `}
        >
          <div className="text-center mb-3">
            <div
              className={`
              text-lg font-bold text-yellow-400 transition-all duration-500
              ${isHovered ? "text-yellow-300 animate-pulse" : ""}
            `}
            >
              Medium Risk
            </div>
            <div
              className={`
              text-xs text-gray-400 transition-all duration-300
              ${isHovered ? "text-orange-300" : ""}
            `}
            >
              Portfolio Risk Level
            </div>
          </div>

          {/* Enhanced Risk Gauge with animations */}
          <div className="relative w-24 h-12 mx-auto mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-t-full"></div>
            <div className="absolute top-1 left-1 right-1 bottom-0 bg-gray-900 rounded-t-full"></div>
            <div
              className={`
              absolute bottom-0 left-1/2 w-0.5 h-6 bg-yellow-400 transform -translate-x-0.5 origin-bottom transition-all duration-1000
              ${isHovered ? "rotate-12 shadow-lg shadow-yellow-400/50" : "rotate-12"}
            `}
              style={{
                transform: isHovered ? "translateX(-50%) rotate(20deg)" : "translateX(-50%) rotate(12deg)",
              }}
            ></div>

            {/* Gauge glow effect */}
            {isHovered && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20 rounded-t-full animate-pulse" />
            )}
          </div>

          {/* Enhanced Risk Metrics with animations */}
          <div className="space-y-1 text-xs">
            {[
              { label: "Max Drawdown", value: "-8.2%", color: "text-red-400" },
              { label: "Position Size", value: "2.5%", color: "text-yellow-400" },
              { label: "Volatility", value: "12.3%", color: "text-orange-400" },
            ].map((metric, i) => (
              <div
                key={metric.label}
                className={`
                  flex justify-between transition-all duration-500
                  ${isHovered ? "transform translate-x-1" : ""}
                `}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span
                  className={`
                  text-gray-400 transition-all duration-300
                  ${isHovered ? "text-orange-300" : ""}
                `}
                >
                  {metric.label}
                </span>
                <span
                  className={`
                  text-white transition-all duration-300
                  ${isHovered ? metric.color : ""}
                `}
                >
                  {metric.value}
                </span>
              </div>
            ))}
          </div>

          {/* Risk alert */}
          {isHovered && (
            <div className="mt-3 text-center">
              <div className="text-xs text-yellow-400 animate-fadeIn">⚠️ Risk within acceptable limits</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
