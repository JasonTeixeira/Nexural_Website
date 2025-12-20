export default function MarketAnalysisIllustration({ isHovered = false }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg relative overflow-hidden">
      {/* Scanning beam effect */}
      {isHovered && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan" />
        </div>
      )}

      <div className="relative w-full max-w-sm space-y-3">
        {/* Market Scanner */}
        <div
          className={`
          bg-gray-900/50 rounded-lg p-3 backdrop-blur-sm transition-all duration-500
          ${isHovered ? "bg-gray-900/70 shadow-lg shadow-blue-500/20" : ""}
        `}
        >
          <div
            className={`
            text-xs text-gray-400 mb-2 transition-all duration-300
            ${isHovered ? "text-blue-300" : ""}
          `}
          >
            Live Market Scanner
          </div>
          <div className="space-y-2">
            {[
              { symbol: "TSLA", change: "+5.67%", signal: "STRONG BUY", color: "green" },
              { symbol: "NVDA", change: "+3.21%", signal: "BUY", color: "green" },
              { symbol: "MSFT", change: "+1.89%", signal: "HOLD", color: "yellow" },
            ].map((stock, i) => (
              <div
                key={i}
                className={`
                  flex justify-between items-center text-xs transition-all duration-500
                  ${isHovered ? "transform translate-x-1" : ""}
                `}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-white">{stock.symbol}</span>
                <span
                  className={`
                  transition-all duration-300
                  ${stock.color === "green" ? "text-green-400" : "text-yellow-400"}
                  ${isHovered ? "animate-pulse" : ""}
                `}
                >
                  {stock.change}
                </span>
                <span
                  className={`
                  text-primary text-[10px] bg-primary/20 px-1 rounded transition-all duration-300
                  ${isHovered ? "bg-primary/40 shadow-sm" : ""}
                `}
                >
                  {stock.signal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Scanning Animation */}
        <div className="flex justify-center space-x-1">
          <div
            className={`w-2 h-2 bg-primary rounded-full transition-all duration-300 ${isHovered ? "animate-bounce" : "animate-pulse"}`}
          ></div>
          <div
            className={`w-2 h-2 bg-blue-400 rounded-full transition-all duration-300 ${isHovered ? "animate-bounce" : "animate-pulse"}`}
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className={`w-2 h-2 bg-cyan-400 rounded-full transition-all duration-300 ${isHovered ? "animate-bounce" : "animate-pulse"}`}
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>

        {/* Live data stream */}
        {isHovered && (
          <div className="text-center">
            <div className="text-xs text-cyan-400 animate-fadeIn">Scanning 2,847 stocks...</div>
          </div>
        )}
      </div>
    </div>
  )
}
