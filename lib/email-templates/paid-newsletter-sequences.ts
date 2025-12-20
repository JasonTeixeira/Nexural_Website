/**
 * Paid Member Newsletter Email Templates
 * Professional sequences for paying subscribers
 */

export interface EmailTemplate {
  subject: string
  previewText: string
  html: string
  text: string
}

// ============================================
// PAID MEMBER NEWSLETTER SEQUENCE (5 EMAILS)
// ============================================

export const paidNewsletterSequence = {
  // Email 1: Welcome & Onboarding (Immediate)
  email1_welcome: {
    subject: "🎉 Welcome to Nexural Trading - Let's Get You Started!",
    previewText: "Your journey to consistent trading profits begins now",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 Welcome to Nexural Trading!</h1>
              <p style="margin: 15px 0 0 0; color: #d1fae5; font-size: 18px;">You're now part of an elite trading community</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
                Congratulations! You've made an excellent decision.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You're now a member of Nexural Trading, where we turn market analysis into consistent profits. Here's what happens next...
              </p>
              
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; padding: 30px; margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 20px;">📋 Your First 24 Hours</h3>
                
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: start; margin-bottom: 15px;">
                    <div style="flex-shrink: 0; width: 30px; height: 30px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: #ffffff; font-weight: bold;">1</span>
                    </div>
                    <div>
                      <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Join Our Discord</strong>
                      <p style="margin: 0; color: #4b5563; font-size: 14px;">Get instant access to signals, analysis, and our community</p>
                      <a href="https://discord.gg/nexuraltrading" style="display: inline-block; margin-top: 10px; color: #3b82f6; text-decoration: none; font-weight: bold;">Join Discord →</a>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: start; margin-bottom: 15px;">
                    <div style="flex-shrink: 0; width: 30px; height: 30px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: #ffffff; font-weight: bold;">2</span>
                    </div>
                    <div>
                      <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Access Your Dashboard</strong>
                      <p style="margin: 0; color: #4b5563; font-size: 14px;">View all active positions, performance, and signals</p>
                      <a href="https://nexuraltrading.com/member-portal/dashboard" style="display: inline-block; margin-top: 10px; color: #3b82f6; text-decoration: none; font-weight: bold;">Go to Dashboard →</a>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: start;">
                    <div style="flex-shrink: 0; width: 30px; height: 30px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: #ffffff; font-weight: bold;">3</span>
                    </div>
                    <div>
                      <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Set Up Your Broker</strong>
                      <p style="margin: 0; color: #4b5563; font-size: 14px;">Connect your trading account (we'll guide you tomorrow)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">🎁 Your Member Benefits</h3>
              
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li><strong>Real-Time Signals:</strong> Get notified instantly when we enter/exit positions</li>
                <li><strong>Detailed Analysis:</strong> Understand the "why" behind every trade</li>
                <li><strong>Private Discord:</strong> Direct access to our team and community</li>
                <li><strong>Performance Dashboard:</strong> Track all positions and P&L in real-time</li>
                <li><strong>Educational Content:</strong> Weekly webinars and trading lessons</li>
                <li><strong>Priority Support:</strong> Get help whenever you need it</li>
              </ul>
              
              <div style="background-color: #fef3c7; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Pro Tip:</strong> Join Discord first! That's where all the action happens. Signals are posted there immediately, and you'll get to know the community.
                </p>
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://discord.gg/nexuraltrading" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 6px; font-weight: bold; font-size: 18px;">
                  Join Discord Now →
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Welcome to the team!<br>
                <strong>The Nexural Trading Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © 2025 Nexural Trading. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
🎉 Welcome to Nexural Trading!

Congratulations! You've made an excellent decision.

You're now a member of Nexural Trading, where we turn market analysis into consistent profits.

📋 YOUR FIRST 24 HOURS:

1. Join Our Discord
   Get instant access to signals, analysis, and our community
   → https://discord.gg/nexuraltrading

2. Access Your Dashboard
   View all active positions, performance, and signals
   → https://nexuraltrading.com/member-portal/dashboard

3. Set Up Your Broker
   Connect your trading account (we'll guide you tomorrow)

🎁 YOUR MEMBER BENEFITS:

• Real-Time Signals: Get notified instantly when we enter/exit positions
• Detailed Analysis: Understand the "why" behind every trade
• Private Discord: Direct access to our team and community
• Performance Dashboard: Track all positions and P&L in real-time
• Educational Content: Weekly webinars and trading lessons
• Priority Support: Get help whenever you need it

💡 Pro Tip: Join Discord first! That's where all the action happens.

Join Discord Now: https://discord.gg/nexuraltrading

Welcome to the team!
The Nexural Trading Team

---
© 2025 Nexural Trading
Unsubscribe: {{unsubscribe_url}}
    `
  } as EmailTemplate,

  // Email 2: Platform Setup (Day 1)
  email2_setup: {
    subject: "📊 Set Up Your Trading Platform in 10 Minutes",
    previewText: "Quick guide to connect your broker and start receiving signals",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">⚡ Nexural Trading</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 16px;">Platform Setup Guide</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">📊 Day 1: Get Your Platform Ready</h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Today we're setting up your trading platform so you're ready when the next signal comes. This takes about 10 minutes.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">🎯 Recommended Brokers</h3>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #3b82f6;">Interactive Brokers (Recommended)</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Best for futures trading, lowest fees, professional platform</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #3b82f6;">TD Ameritrade</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Great for beginners, excellent support, user-friendly</p>
                </div>
                
                <div>
                  <strong style="color: #3b82f6;">TradeStation</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Advanced charting, good for active traders</p>
                </div>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">📝 Setup Checklist</h3>
              
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; padding: 25px; margin: 20px 0;">
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; align-items: center; color: #065f46; font-size: 16px;">
                    <input type="checkbox" style="margin-right: 10px; width: 20px; height: 20px;">
                    Open a futures trading account
                  </label>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; align-items: center; color: #065f46; font-size: 16px;">
                    <input type="checkbox" style="margin-right: 10px; width: 20px; height: 20px;">
                    Fund your account (minimum $5,000 recommended)
                  </label>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; align-items: center; color: #065f46; font-size: 16px;">
                    <input type="checkbox" style="margin-right: 10px; width: 20px; height: 20px;">
                    Enable futures trading permissions
                  </label>
                </div>
                
                <div>
                  <label style="display: flex; align-items: center; color: #065f46; font-size: 16px;">
                    <input type="checkbox" style="margin-right: 10px; width: 20px; height: 20px;">
                    Download trading platform software
                  </label>
                </div>
              </div>
              
              <div style="background-color: #fef3c7; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> Start with paper trading if you're new! Most brokers offer simulated trading accounts where you can practice with fake money before risking real capital.
                </p>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">📚 Resources</h3>
              
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li><a href="https://nexuraltrading.com/broker-setup-guide" style="color: #3b82f6; text-decoration: none;">Complete Broker Setup Guide</a></li>
                <li><a href="https://nexuraltrading.com/platform-tutorial" style="color: #3b82f6; text-decoration: none;">Platform Tutorial Videos</a></li>
                <li><a href="https://discord.gg/nexuraltrading" style="color: #3b82f6; text-decoration: none;">Ask Questions in Discord</a></li>
              </ul>
              
              <p style="margin: 30px 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tomorrow, I'll walk you through your first signal and how to execute it...
              </p>
              
              <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To your success,<br>
                <strong>The Nexural Trading Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © 2025 Nexural Trading. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
📊 Day 1: Get Your Platform Ready

Today we're setting up your trading platform so you're ready when the next signal comes. This takes about 10 minutes.

🎯 RECOMMENDED BROKERS:

Interactive Brokers (Recommended)
Best for futures trading, lowest fees, professional platform

TD Ameritrade
Great for beginners, excellent support, user-friendly

TradeStation
Advanced charting, good for active traders

📝 SETUP CHECKLIST:

☐ Open a futures trading account
☐ Fund your account (minimum $5,000 recommended)
☐ Enable futures trading permissions
☐ Download trading platform software

⚠️ Important: Start with paper trading if you're new! Most brokers offer simulated trading accounts.

📚 RESOURCES:

• Complete Broker Setup Guide: https://nexuraltrading.com/broker-setup-guide
• Platform Tutorial Videos: https://nexuraltrading.com/platform-tutorial
• Ask Questions in Discord: https://discord.gg/nexuraltrading

Tomorrow, I'll walk you through your first signal and how to execute it...

To your success,
The Nexural Trading Team

---
© 2025 Nexural Trading
Unsubscribe: {{unsubscribe_url}}
    `
  } as EmailTemplate,

  // Email 3: First Signal Walkthrough (Day 3)
  email3_first_signal: {
    subject: "🎯 Your First Signal: Step-by-Step Walkthrough",
    previewText: "Learn how to execute trades like a pro",
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1)"><tr><td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:40px 30px;text-align:center"><h1 style="margin:0;color:#fff;font-size:28px">⚡ Nexural Trading</h1><p style="margin:10px 0 0 0;color:#fef3c7;font-size:16px">First Signal Guide</p></td></tr><tr><td style="padding:40px 30px"><h2 style="margin:0 0 20px 0;color:#1f2937;font-size:24px">🎯 Day 3: Execute Your First Trade</h2><p style="margin:0 0 20px 0;color:#4b5563;font-size:16px;line-height:1.6">Today I'll walk you through exactly how to execute a signal when it comes through Discord...</p><div style="background:#fef3c7;border-radius:8px;padding:25px;margin:30px 0"><h3 style="margin:0 0 15px 0;color:#92400e;font-size:18px">📱 Example Signal</h3><p style="margin:0;color:#92400e;font-size:14px;font-family:monospace">🚨 NEW SIGNAL 🚨<br>Symbol: ES (S&P 500 E-mini)<br>Direction: LONG<br>Entry: 4,520<br>Stop Loss: 4,500<br>Target: 4,560<br>Risk: 20 points | Reward: 40 points<br>Risk/Reward: 1:2</p></div><h3 style="margin:30px 0 15px 0;color:#1f2937;font-size:20px">📝 Step-by-Step Execution</h3><ol style="margin:0 0 30px 0;padding-left:20px;color:#4b5563;font-size:16px;line-height:1.8"><li><strong>Open your trading platform</strong></li><li><strong>Find the symbol</strong> (ES in this case)</li><li><strong>Set up your order:</strong><ul><li>Order type: Limit</li><li>Price: 4,520</li><li>Quantity: 1 contract</li></ul></li><li><strong>Set stop loss</strong> at 4,500</li><li><strong>Set profit target</strong> at 4,560</li><li><strong>Submit the order</strong></li></ol><div style="background:#ecfdf5;border-left:4px solid #10b981;padding:20px;margin:30px 0"><p style="margin:0;color:#065f46;font-size:15px;line-height:1.6"><strong>💡 Pro Tip:</strong> Always set your stop loss BEFORE entering the trade. Never trade without a stop loss!</p></div><p style="margin:30px 0 20px 0;color:#4b5563;font-size:16px;line-height:1.6">Questions? Ask in Discord! The community is here to help.</p><p style="margin:0;color:#4b5563;font-size:16px">To your success,<br><strong>The Nexural Trading Team</strong></p></td></tr><tr><td style="background:#f9fafb;padding:30px;text-align:center;border-top:1px solid #e5e7eb"><p style="margin:0 0 10px 0;color:#6b7280;font-size:14px">© 2025 Nexural Trading</p><p style="margin:0;color:#9ca3af;font-size:12px"><a href="{{unsubscribe_url}}" style="color:#9ca3af">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`,
    text: `🎯 Day 3: Execute Your First Trade\n\nToday I'll walk you through exactly how to execute a signal...\n\n📱 EXAMPLE SIGNAL:\n🚨 NEW SIGNAL 🚨\nSymbol: ES (S&P 500 E-mini)\nDirection: LONG\nEntry: 4,520\nStop Loss: 4,500\nTarget: 4,560\nRisk/Reward: 1:2\n\n📝 STEP-BY-STEP:\n1. Open your trading platform\n2. Find the symbol (ES)\n3. Set up limit order at 4,520\n4. Set stop loss at 4,500\n5. Set profit target at 4,560\n6. Submit the order\n\n💡 Pro Tip: Always set your stop loss BEFORE entering!\n\nQuestions? Ask in Discord!\n\n---\n© 2025 Nexural Trading\nUnsubscribe: {{unsubscribe_url}}`
  } as EmailTemplate,

  // Email 4: Community & Discord (Day 7)
  email4_community: {
    subject: "👥 Meet Your Trading Community",
    previewText: "Connect with fellow traders and maximize your success",
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1)"><tr><td style="background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);padding:40px 30px;text-align:center"><h1 style="margin:0;color:#fff;font-size:28px">⚡ Nexural Trading</h1><p style="margin:10px 0 0 0;color:#ede9fe;font-size:16px">Your Trading Community</p></td></tr><tr><td style="padding:40px 30px"><h2 style="margin:0 0 20px 0;color:#1f2937;font-size:24px">👥 Day 7: The Power of Community</h2><p style="margin:0 0 20px 0;color:#4b5563;font-size:16px;line-height:1.6">Trading can be lonely. But it doesn't have to be. Our Discord community is where the magic happens...</p><h3 style="margin:30px 0 15px 0;color:#1f2937;font-size:20px">💬 What Happens in Discord</h3><ul style="margin:0 0 30px 0;padding-left:20px;color:#4b5563;font-size:16px;line-height:1.8"><li><strong>Real-Time Signals:</strong> Instant notifications when we enter/exit</li><li><strong>Live Analysis:</strong> Market commentary throughout the day</li><li><strong>Trade Discussion:</strong> Ask questions, share insights</li><li><strong>Weekly Webinars:</strong> Live training sessions</li><li><strong>Member Success:</strong> Celebrate wins together</li></ul><div style="background:#dbeafe;border-radius:8px;padding:25px;margin:30px 0;text-align:center"><h3 style="margin:0 0 15px 0;color:#1e40af;font-size:20px">🎯 Community Guidelines</h3><p style="margin:0 0 10px 0;color:#1e3a8a;font-size:14px">• Be respectful and supportive<br>• Share knowledge, not spam<br>• No financial advice (we're not advisors)<br>• Help others succeed</p></div><div style="text-align:center;margin:40px 0"><a href="https://discord.gg/nexuraltrading" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;padding:18px 50px;border-radius:6px;font-weight:bold;font-size:18px">Join Discord →</a></div><p style="margin:0;color:#4b5563;font-size:16px">See you in Discord!<br><strong>The Nexural Trading Team</strong></p></td></tr><tr><td style="background:#f9fafb;padding:30px;text-align:center;border-top:1px solid #e5e7eb"><p style="margin:0 0 10px 0;color:#6b7280;font-size:14px">© 2025 Nexural Trading</p><p style="margin:0;color:#9ca3af;font-size:12px"><a href="{{unsubscribe_url}}" style="color:#9ca3af">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`,
    text: `👥 Day 7: The Power of Community\n\nTrading can be lonely. But it doesn't have to be.\n\n💬 WHAT HAPPENS IN DISCORD:\n• Real-Time Signals: Instant notifications\n• Live Analysis: Market commentary\n• Trade Discussion: Ask questions\n• Weekly Webinars: Live training\n• Member Success: Celebrate wins\n\n🎯 COMMUNITY GUIDELINES:\n• Be respectful and supportive\n• Share knowledge, not spam\n• No financial advice\n• Help others succeed\n\nJoin Discord: https://discord.gg/nexuraltrading\n\nSee you there!\n\n---\n© 2025 Nexural Trading\nUnsubscribe: {{unsubscribe_url}}`
  } as EmailTemplate,

  // Email 5: Weekly Performance Updates
  email5_performance: {
    subject: "📊 This Week's Performance + What's Next",
    previewText: "Weekly recap and upcoming opportunities",
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1)"><tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 30px;text-align:center"><h1 style="margin:0;color:#fff;font-size:28px">⚡ Nexural Trading</h1><p style="margin:10px 0 0 0;color:#d1fae5;font-size:16px">Weekly Performance Report</p></td></tr><tr><td style="padding:40px 30px"><h2 style="margin:0 0 20px 0;color:#1f2937;font-size:24px">📊 This Week's Results</h2><div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:8px;padding:30px;margin:30px 0"><table width="100%" cellpadding="10" cellspacing="0"><tr><td style="border-bottom:1px solid #a7f3d0;padding:15px 0"><strong style="color:#065f46;font-size:16px">Total Signals:</strong></td><td style="border-bottom:1px solid #a7f3d0;padding:15px 0;text-align:right"><span style="color:#047857;font-size:18px;font-weight:bold">5</span></td></tr><tr><td style="border-bottom:1px solid #a7f3d0;padding:15px 0"><strong style="color:#065f46;font-size:16px">Win Rate:</strong></td><td style="border-bottom:1px solid #a7f3d0;padding:15px 0;text-align:right"><span style="color:#047857;font-size:18px;font-weight:bold">80%</span></td></tr><tr><td style="padding:15px 0"><strong style="color:#065f46;font-size:16px">Net P&L:</strong></td><td style="padding:15px 0;text-align:right"><span style="color:#047857;font-size:18px;font-weight:bold">+$3,240</span></td></tr></table></div><h3 style="margin:30px 0 15px 0;color:#1f2937;font-size:20px">🎯 Next Week's Focus</h3><p style="margin:0 0 20px 0;color:#4b5563;font-size:16px;line-height:1.6">We're watching for continuation patterns in tech stocks and potential reversals in energy. Key levels to watch...</p><div style="background:#eff6ff;border-radius:6px;padding:20px;margin:30px 0"><p style="margin:0;color:#1e40af;font-size:14px;line-height:1.6"><strong>📅 Upcoming Events:</strong><br>• Wednesday: Fed Meeting<br>• Thursday: Earnings Reports<br>• Friday: Jobs Data</p></div><p style="margin:30px 0 0 0;color:#4b5563;font-size:16px">Stay sharp!<br><strong>The Nexural Trading Team</strong></p></td></tr><tr><td style="background:#f9fafb;padding:30px;text-align:center;border-top:1px solid #e5e7eb"><p style="margin:0 0 10px 0;color:#6b7280;font-size:14px">© 2025 Nexural Trading</p><p style="margin:0;color:#9ca3af;font-size:12px"><a href="{{unsubscribe_url}}" style="color:#9ca3af">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`,
    text: `📊 This Week's Results\n\nTOTAL SIGNALS: 5\nWIN RATE: 80%\nNET P&L: +$3,240\n\n🎯 NEXT WEEK'S FOCUS:\nWatching for continuation patterns in tech and potential reversals in energy.\n\n📅 UPCOMING EVENTS:\n• Wednesday: Fed Meeting\n• Thursday: Earnings Reports\n• Friday: Jobs Data\n\nStay sharp!\nThe Nexural Trading Team\n\n---\n© 2025 Nexural Trading\nUnsubscribe: {{unsubscribe_url}}`
  } as EmailTemplate
}

export default paidNewsletterSequence
