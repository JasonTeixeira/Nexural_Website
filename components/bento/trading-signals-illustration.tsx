export default function TradingSignalsIllustration({ isHovered = false }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg relative overflow-hidden">
      {/* Animated background particles */}
      {isHovered && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-green-400/60 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm">
        {/* Stock Chart Visualization */}
        <div
          className={`
          bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm transition-all duration-500
          ${isHovered ? "bg-gray-900/70 shadow-lg shadow-green-500/20" : ""}
        `}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-green-400 text-sm font-medium transition-all duration-300 ${isHovered ? "text-green-300" : ""}`}
            >
              AAPL
            </span>
            <span
              className={`text-green-400 text-sm transition-all duration-300 ${isHovered ? "text-green-300 animate-pulse" : ""}`}
            >
              +2.34%
            </span>
          </div>

          {/* Enhanced Chart with animations */}
          <div className="relative h-24 flex items-end space-x-1">
            {[12, 18, 15, 22, 28, 25, 32, 29, 35, 31, 38, 42].map((height, i) => (
              <div
                key={i}
                className={`
                  bg-gradient-to-t from-green-500 to-green-300 rounded-sm flex-1 transition-all duration-500
                  ${isHovered ? "shadow-lg shadow-green-500/30" : ""}
                `}
                style={{
                  height: `${height}px`,
                  transform: isHovered ? `scaleY(${1 + Math.sin(i * 0.5) * 0.2})` : "scaleY(1)",
                  transitionDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>

          {/* Enhanced AI Signal Badge */}
          <div
            className={`
            absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full transition-all duration-300
            ${isHovered ? "animate-bounce bg-green-500 shadow-lg shadow-green-500/50" : ""}
          `}
          >
            AI BUY
          </div>

          {/* Profit indicator */}
          {isHovered && (
            <div className="absolute bottom-2 left-2 text-green-400 text-xs animate-fadeIn">+$1,247 profit</div>
          )}
        </div>
      </div>
    </div>
  )
}
