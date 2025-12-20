import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Disclaimer | Nexural Trading',
  description: 'Important legal disclaimer and risk disclosure for Nexural Trading platform',
}

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-6">Legal Disclaimer</h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: November 11, 2025
          </p>

          {/* Critical Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              ⚠️ IMPORTANT: READ THIS CAREFULLY
            </h2>
            <p className="text-lg font-semibold mb-4">
              Trading futures, options, and other financial instruments carries SUBSTANTIAL RISK 
              and is NOT suitable for everyone. You may LOSE MORE than your initial investment.
            </p>
            <p className="font-semibold">
              Before using our Service or trading, carefully consider whether trading is appropriate 
              for your financial situation and risk tolerance.
            </p>
          </div>

          <div className="space-y-8 text-foreground">
            {/* 1. No Financial Advice */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Not Financial or Investment Advice</h2>
              <p className="mb-4">
                Nexural Trading is an <strong>educational platform</strong> that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Educational content about trading</li>
                <li>Market analysis and commentary</li>
                <li>Trading tools and indicators</li>
                <li>Community discussion platform</li>
              </ul>
              <p className="mb-4 font-semibold text-yellow-600 dark:text-yellow-500">
                WE ARE NOT:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Financial advisors</li>
                <li>Investment advisors</li>
                <li>Registered broker-dealers</li>
                <li>Commodity trading advisors (CTAs)</li>
                <li>Licensed professionals providing personalized advice</li>
              </ul>
              <p className="font-semibold">
                Nothing on our platform constitutes financial, investment, legal, or tax advice. 
                All content is for educational and informational purposes only.
              </p>
            </section>

            {/* 2. Your Responsibility */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Your Sole Responsibility</h2>
              <p className="mb-4">
                <strong>YOU ARE SOLELY RESPONSIBLE FOR:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>All trading decisions and actions</li>
                <li>Evaluating risks before trading</li>
                <li>Understanding the instruments you trade</li>
                <li>Managing your capital and risk</li>
                <li>Complying with applicable laws</li>
                <li>Any losses or consequences from trading</li>
              </ul>
              <p className="font-semibold text-red-600 dark:text-red-400">
                We are NOT responsible for your trading results, profits, or losses.
              </p>
            </section>

            {/* 3. No Guarantees */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. No Guarantees or Promises</h2>
              <p className="mb-4">
                We make <strong>NO GUARANTEES</strong> about:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Trading results or profitability</li>
                <li>Accuracy of signals or indicators</li>
                <li>Future performance of strategies</li>
                <li>Return on investment (ROI)</li>
                <li>Success or failure rates</li>
                <li>Specific outcomes or results</li>
              </ul>
              <p className="mb-4 font-semibold">
                <strong>PAST PERFORMANCE DOES NOT GUARANTEE FUTURE RESULTS.</strong>
              </p>
              <p>
                Historical results, backtests, and examples are for illustration only and 
                may not reflect real trading conditions or actual results.
              </p>
            </section>

            {/* 4. Trading Risks */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Substantial Trading Risks</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">4.1 General Risks</h3>
              <p className="mb-4">Trading involves substantial risk, including:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Loss of Capital:</strong> You may lose some or ALL of your investment</li>
                <li><strong>Leverage Risk:</strong> Leveraged products amplify both gains AND losses</li>
                <li><strong>Volatility:</strong> Markets can move rapidly against your positions</li>
                <li><strong>Liquidity Risk:</strong> You may not be able to exit positions when desired</li>
                <li><strong>Gap Risk:</strong> Prices may gap beyond stop-loss orders</li>
                <li><strong>Slippage:</strong> Execution prices may differ from expected prices</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Futures Trading Risks</h3>
              <p className="mb-4">Futures contracts carry EXTREME risk:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>High leverage (10x-50x) can lead to rapid, substantial losses</li>
                <li>You may lose MORE than your initial margin deposit</li>
                <li>Margin calls may force liquidation at unfavorable prices</li>
                <li>24/5 markets mean risk exposure even when you're not monitoring</li>
                <li>Correlation breakdowns can cause unexpected losses</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Options Trading Risks</h3>
              <p className="mb-4">Options trading is COMPLEX and RISKY:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Options can expire worthless (100% loss)</li>
                <li>Time decay erodes option value daily</li>
                <li>Implied volatility changes affect pricing</li>
                <li>Selling options creates UNLIMITED risk potential</li>
                <li>Early assignment can result in unexpected positions</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.4 Technology Risks</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>System failures or delays</li>
                <li>Internet connectivity issues</li>
                <li>Platform outages</li>
                <li>Data feed errors</li>
                <li>Order execution failures</li>
              </ul>
            </section>

            {/* 5. Hypothetical Performance */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Hypothetical Performance Disclosure</h2>
              <p className="mb-4">
                Any hypothetical or simulated performance results have INHERENT LIMITATIONS:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Results are based on hindsight and perfect information</li>
                <li>Do not reflect actual trading or real market conditions</li>
                <li>May not account for slippage, commissions, or fees</li>
                <li>Cannot fully account for financial risk or emotional factors</li>
                <li>May be optimized to show favorable results</li>
                <li>Are NOT indicative of future performance</li>
              </ul>
              <p className="font-semibold text-red-600 dark:text-red-400">
                ACTUAL RESULTS WILL VARY and are likely to be WORSE than hypothetical results.
              </p>
            </section>

            {/* 6. AI and Automated Systems */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. AI-Powered Tools Disclaimer</h2>
              <p className="mb-4">
                Our AI-powered trading signals and indicators:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Are provided "AS IS" without warranties</li>
                <li>May contain errors, bugs, or inaccuracies</li>
                <li>Are NOT guaranteed to be profitable</li>
                <li>Depend on data quality and market conditions</li>
                <li>Require human judgment and oversight</li>
                <li>Should NOT be blindly followed</li>
              </ul>
              <p className="font-semibold">
                NEVER trade solely based on automated signals. Always use your own analysis and judgment.
              </p>
            </section>

            {/* 7. Educational Purpose */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Educational Purpose Only</h2>
              <p className="mb-4">
                All content, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Trading signals and indicators</li>
                <li>Market analysis and commentary</li>
                <li>Strategy discussions</li>
                <li>Performance metrics</li>
                <li>Educational videos and articles</li>
                <li>Community discussions</li>
              </ul>
              <p className="mb-4">
                ...is provided for <strong>EDUCATIONAL PURPOSES ONLY</strong> to help you understand 
                trading concepts and develop your own strategies.
              </p>
              <p className="font-semibold">
                This content should NOT be construed as specific recommendations to buy or sell 
                any security or financial instrument.
              </p>
            </section>

            {/* 8. Seek Professional Advice */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Consult Professional Advisors</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
                <p className="mb-4">
                  <strong>BEFORE TRADING, YOU SHOULD:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Consult with a licensed financial advisor</li>
                  <li>Seek advice from a qualified tax professional</li>
                  <li>Understand your broker's terms and fees</li>
                  <li>Read regulatory disclosures (CFTC, SEC, NFA)</li>
                  <li>Ensure you meet suitability requirements</li>
                </ul>
              </div>
            </section>

            {/* 9. Risk Capital Only */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Trade with Risk Capital Only</h2>
              <p className="mb-4 font-semibold text-red-600 dark:text-red-400">
                NEVER TRADE WITH MONEY YOU CANNOT AFFORD TO LOSE
              </p>
              <p className="mb-4">
                Only use "risk capital" - money set aside specifically for high-risk ventures. 
                Do NOT trade with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Rent or mortgage money</li>
                <li>Emergency funds</li>
                <li>Retirement savings</li>
                <li>College funds</li>
                <li>Money needed for living expenses</li>
                <li>Borrowed or leveraged funds</li>
              </ul>
            </section>

            {/* 10. No Endorsements */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. No Endorsements</h2>
              <p className="mb-4">
                References to specific brokers, platforms, or third-party services are for 
                informational purposes only and do NOT constitute:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Endorsements or recommendations</li>
                <li>Guarantees of quality or performance</li>
                <li>Suggestions that you should use these services</li>
              </ul>
            </section>

            {/* 11. Regulatory Status */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Regulatory Status</h2>
              <p className="mb-4">
                Nexural Trading is NOT:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Registered with the SEC (Securities and Exchange Commission)</li>
                <li>Registered with the CFTC (Commodity Futures Trading Commission)</li>
                <li>A member of NFA (National Futures Association)</li>
                <li>A member of FINRA (Financial Industry Regulatory Authority)</li>
                <li>Licensed to provide investment advice</li>
              </ul>
              <p>
                We are an educational platform providing information and tools, NOT regulated 
                financial services.
              </p>
            </section>

            {/* 12. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>We are NOT liable for any trading losses or financial damages</li>
                <li>We are NOT liable for errors in signals, data, or content</li>
                <li>We are NOT liable for missed opportunities or failed trades</li>
                <li>We are NOT liable for system failures or downtime</li>
                <li>We are NOT liable for third-party actions or services</li>
              </ul>
              <p className="font-semibold">
                By using our Service, you WAIVE any claims against Nexural Trading for trading losses.
              </p>
            </section>

            {/* 13. Accuracy of Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. No Warranty of Accuracy</h2>
              <p className="mb-4">
                While we strive for accuracy, we make NO WARRANTIES about:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accuracy, completeness, or timeliness of information</li>
                <li>Reliability of data feeds or market data</li>
                <li>Correctness of calculations or analysis</li>
                <li>Suitability for any particular purpose</li>
              </ul>
            </section>

            {/* 14. Geographic Restrictions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Geographic Restrictions</h2>
              <p className="mb-4">
                Trading regulations vary by jurisdiction. Our Service may not be available or 
                suitable for residents of certain countries or regions.
              </p>
              <p className="font-semibold">
                It is YOUR responsibility to ensure compliance with local laws and regulations.
              </p>
            </section>

            {/* 15. Changes to Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Changes to This Disclaimer</h2>
              <p>
                We reserve the right to modify this disclaimer at any time without notice. 
                Continued use of the Service constitutes acceptance of any changes.
              </p>
            </section>

            {/* 16. Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">16. Questions</h2>
              <p className="mb-4">
                For questions about this disclaimer, contact:
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p><strong>Nexural Trading</strong></p>
                <p>Email: legal@nexural.io</p>
                <p>Support: support@nexural.io</p>
              </div>
            </section>

            {/* Final Acknowledgment */}
            <section className="border-t pt-6 mt-8">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">ACKNOWLEDGMENT</h3>
                <p className="mb-4">
                  BY USING OUR SERVICE, YOU ACKNOWLEDGE THAT:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>You have read and understood this Legal Disclaimer</li>
                  <li>You understand the substantial risks of trading</li>
                  <li>You accept sole responsibility for all trading decisions</li>
                  <li>You will not hold Nexural Trading liable for any losses</li>
                  <li>You will seek professional advice if needed</li>
                  <li>You will only trade with risk capital you can afford to lose</li>
                </ul>
                <p className="font-bold text-lg text-red-600 dark:text-red-400">
                  IF YOU DO NOT AGREE, DO NOT USE OUR SERVICE
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
