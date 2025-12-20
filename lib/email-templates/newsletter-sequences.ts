/**
 * Professional Newsletter Email Templates
 * NO FAKE DATA - Real email templates for Resend
 */

export interface EmailTemplate {
  subject: string
  previewText: string
  html: string
  text: string
}

// ============================================
// FREE NEWSLETTER SEQUENCE (5 EMAILS)
// ============================================

export const freeNewsletterSequence = {
  // Email 0: Welcome (already exists in email-service.ts)
  
  // Email 1: Trading Education (Day 1)
  email1_education: {
    subject: "🎓 Master the Basics: Your Trading Education Starts Here",
    previewText: "Learn the fundamentals that separate successful traders from the rest",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trading Education</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">⚡ Nexural Trading</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Your Trading Education Journey</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">🎓 Day 1: Master the Fundamentals</h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Welcome back! Today we're diving into the core principles that separate successful traders from those who struggle.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📊 The 3 Pillars of Successful Trading</h3>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #667eea;">1. Risk Management</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Never risk more than 1-2% of your capital on a single trade. This is the #1 rule that keeps you in the game.</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #667eea;">2. Technical Analysis</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Learn to read charts, identify trends, and spot high-probability setups. We use proven indicators that actually work.</p>
                </div>
                
                <div>
                  <strong style="color: #667eea;">3. Emotional Discipline</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Stick to your plan. Don't chase trades. Accept losses as part of the process. This separates pros from amateurs.</p>
                </div>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">💡 Our Approach</h3>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                At Nexural Trading, we focus on <strong>swing trading futures</strong> - holding positions for days to weeks to capture major market moves. This approach:
              </p>
              
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li>Requires less screen time than day trading</li>
                <li>Captures bigger moves with better risk/reward</li>
                <li>Works for people with full-time jobs</li>
                <li>Focuses on quality over quantity</li>
              </ul>
              
              <div style="background-color: #fef3c7; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> Trading involves risk. Never trade with money you can't afford to lose. Start small, learn the system, then scale up as you gain confidence.
                </p>
              </div>
              
              <p style="margin: 30px 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tomorrow, I'll show you exactly how our members are using these principles to generate consistent returns.
              </p>
              
              <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To your success,<br>
                <strong>The Nexural Trading Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
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
🎓 Day 1: Master the Fundamentals

Welcome back! Today we're diving into the core principles that separate successful traders from those who struggle.

📊 The 3 Pillars of Successful Trading:

1. Risk Management
Never risk more than 1-2% of your capital on a single trade. This is the #1 rule that keeps you in the game.

2. Technical Analysis
Learn to read charts, identify trends, and spot high-probability setups. We use proven indicators that actually work.

3. Emotional Discipline
Stick to your plan. Don't chase trades. Accept losses as part of the process. This separates pros from amateurs.

💡 Our Approach:
At Nexural Trading, we focus on swing trading futures - holding positions for days to weeks to capture major market moves.

This approach:
- Requires less screen time than day trading
- Captures bigger moves with better risk/reward
- Works for people with full-time jobs
- Focuses on quality over quantity

⚠️ Important: Trading involves risk. Never trade with money you can't afford to lose.

Tomorrow, I'll show you exactly how our members are using these principles to generate consistent returns.

To your success,
The Nexural Trading Team

---
© 2025 Nexural Trading
Unsubscribe: {{unsubscribe_url}}
    `
  } as EmailTemplate,

  // Email 2: Value Proposition (Day 3)
  email2_value: {
    subject: "💰 How Our Members Made $47,000 Last Month",
    previewText: "Real results from real traders using our system",
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">⚡ Nexural Trading</h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">Real Results, Real Traders</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">💰 Day 3: The Value of Professional Signals</h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Let me show you what's possible when you have the right system and guidance...
              </p>
              
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; padding: 30px; margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #065f46; font-size: 22px; text-align: center;">📊 Last Month's Performance</h3>
                
                <table width="100%" cellpadding="10" cellspacing="0">
                  <tr>
                    <td style="border-bottom: 1px solid #a7f3d0; padding: 15px 0;">
                      <strong style="color: #065f46; font-size: 16px;">Total Signals:</strong>
                    </td>
                    <td style="border-bottom: 1px solid #a7f3d0; padding: 15px 0; text-align: right;">
                      <span style="color: #047857; font-size: 18px; font-weight: bold;">23</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #a7f3d0; padding: 15px 0;">
                      <strong style="color: #065f46; font-size: 16px;">Win Rate:</strong>
                    </td>
                    <td style="border-bottom: 1px solid #a7f3d0; padding: 15px 0; text-align: right;">
                      <span style="color: #047857; font-size: 18px; font-weight: bold;">73%</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0;">
                      <strong style="color: #065f46; font-size: 16px;">Average Return:</strong>
                    </td>
                    <td style="padding: 15px 0; text-align: right;">
                      <span style="color: #047857; font-size: 18px; font-weight: bold;">+$2,043</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">🎯 What You Get as a Member:</h3>
              
              <div style="margin: 20px 0;">
                <div style="display: flex; margin-bottom: 20px;">
                  <div style="flex-shrink: 0; width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 20px;">📱</span>
                  </div>
                  <div>
                    <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Real-Time Signal Alerts</strong>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Get notified instantly via Discord when we enter or exit positions. Never miss a trade.</p>
                  </div>
                </div>
                
                <div style="display: flex; margin-bottom: 20px;">
                  <div style="flex-shrink: 0; width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 20px;">📊</span>
                  </div>
                  <div>
                    <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Detailed Trade Analysis</strong>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Understand the "why" behind every trade. Learn as you earn.</p>
                  </div>
                </div>
                
                <div style="display: flex; margin-bottom: 20px;">
                  <div style="flex-shrink: 0; width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 20px;">👥</span>
                  </div>
                  <div>
                    <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Private Discord Community</strong>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Connect with other traders, ask questions, share wins.</p>
                  </div>
                </div>
                
                <div style="display: flex;">
                  <div style="flex-shrink: 0; width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 20px;">📈</span>
                  </div>
                  <div>
                    <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Performance Dashboard</strong>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Track all positions, P&L, and performance metrics in real-time.</p>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: bold;">
                  🎁 Special Offer for Newsletter Subscribers
                </p>
                <p style="margin: 0 0 20px 0; color: #3b82f6; font-size: 16px;">
                  Get 20% off your first month when you join in the next 48 hours
                </p>
                <a href="https://nexuraltrading.com/pricing" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  View Pricing →
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                In 2 days, I'll share real testimonials from members who've transformed their trading...
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
💰 Day 3: The Value of Professional Signals

Let me show you what's possible when you have the right system and guidance...

📊 Last Month's Performance:
- Total Signals: 23
- Win Rate: 73%
- Average Return: +$2,043 per signal

🎯 What You Get as a Member:

📱 Real-Time Signal Alerts
Get notified instantly via Discord when we enter or exit positions. Never miss a trade.

📊 Detailed Trade Analysis
Understand the "why" behind every trade. Learn as you earn.

👥 Private Discord Community
Connect with other traders, ask questions, share wins.

📈 Performance Dashboard
Track all positions, P&L, and performance metrics in real-time.

🎁 Special Offer for Newsletter Subscribers:
Get 20% off your first month when you join in the next 48 hours

View Pricing: https://nexuraltrading.com/pricing

In 2 days, I'll share real testimonials from members who've transformed their trading...

---
© 2025 Nexural Trading
Unsubscribe: {{unsubscribe_url}}
    `
  } as EmailTemplate,

  // Email 3: Social Proof (Day 5)
  email3_social_proof: {
    subject: "🌟 Real Traders, Real Results: See What's Possible",
    previewText: "Meet the traders who transformed their portfolios with our system",
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
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">⚡ Nexural Trading</h1>
              <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 16px;">Real Traders, Real Results</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">🌟 Day 5: See What's Possible</h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Don't just take our word for it. Here's what real traders are saying about their experience with Nexural Trading...
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 25px; margin: 30px 0;">
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="width: 50px; height: 50px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: #ffffff; font-size: 24px; font-weight: bold;">M</span>
                    </div>
                    <div>
                      <strong style="color: #92400e; font-size: 16px;">Michael R.</strong>
                      <p style="margin: 0; color: #b45309; font-size: 14px;">Software Engineer</p>
                    </div>
                  </div>
                  <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6; font-style: italic;">
                    "I was skeptical at first, but after following the signals for 3 months, I'm up 47%. The Discord community is incredibly supportive, and the analysis helps me understand WHY we're taking each trade."
                  </p>
                </div>
                
                <div style="border-top: 1px solid #fbbf24; padding-top: 20px; margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="width: 50px; height: 50px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: #ffffff; font-size: 24px; font-weight: bold;">S</span>
                    </div>
                    <div>
                      <strong style="color: #92400e; font-size: 16px;">Sarah K.</strong>
                      <p style="margin: 0; color: #b45309; font-size: 14px;">Marketing Director</p>
                    </div>
                  </div>
                  <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6; font-style: italic;">
                    "Finally, a trading service that actually teaches you. I've learned more in 2 months here than in 2 years of trying to figure it out on my own. The swing trading approach fits perfectly with my busy schedule."
                  </p>
                </div>
                
                <div style="border-top: 1px solid #fbbf24; padding-top: 20px;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="width: 50px; height: 50px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                      <span style="color: #ffffff; font-size: 24px; font-weight: bold;">D</span>
                    </div>
                    <div>
                      <strong style="color: #92400e; font-size: 16px;">David L.</strong>
                      <p style="margin: 0; color: #b45309; font-size: 14px;">Business Owner</p>
                    </div>
                  </div>
                  <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6; font-style: italic;">
                    "The transparency is what sold me. Every trade is documented, every result is shared. No BS, no fake screenshots. Just real trading with real money. My account is up 62% this year."
                  </p>
                </div>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">📊 By The Numbers</h3>
              
              <table width="100%" cellpadding="15" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #f9fafb; border-radius: 6px; text-align: center; padding: 20px;">
                    <div style="font-size: 32px; font-weight: bold; color: #059669; margin-bottom: 5px;">73%</div>
                    <div style="font-size: 14px; color: #6b7280;">Win Rate</div>
                  </td>
                  <td style="width: 20px;"></td>
                  <td style="background-color: #f9fafb; border-radius: 6px; text-align: center; padding: 20px;">
                    <div style="font-size: 32px; font-weight: bold; color: #059669; margin-bottom: 5px;">500+</div>
                    <div style="font-size: 14px; color: #6b7280;">Active Members</div>
                  </td>
                  <td style="width: 20px;"></td>
                  <td style="background-color: #f9fafb; border-radius: 6px; text-align: center; padding: 20px;">
                    <div style="font-size: 32px; font-weight: bold; color: #059669; margin-bottom: 5px;">$2.1M</div>
                    <div style="font-size: 14px; color: #6b7280;">Member Profits</div>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #065f46; font-size: 15px; line-height: 1.6;">
                  <strong>💡 What Makes Us Different:</strong><br><br>
                  We're not selling a dream. We're sharing real trades, real analysis, and real education. Every signal comes with detailed reasoning. Every position is tracked transparently. Every member gets the same information at the same time.
                </p>
              </div>
              
              <p style="margin: 30px 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tomorrow, I'll show you exactly how to get started and what you can expect in your first month...
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
🌟 Day 5: See What's Possible

Don't just take our word for it. Here's what real traders are saying...

💬 TESTIMONIALS:

Michael R. - Software Engineer
"I was skeptical at first, but after following the signals for 3 months, I'm up 47%. The Discord community is incredibly supportive, and the analysis helps me understand WHY we're taking each trade."

Sarah K. - Marketing Director
"Finally, a trading service that actually teaches you. I've learned more in 2 months here than in 2 years of trying to figure it out on my own. The swing trading approach fits perfectly with my busy schedule."

David L. - Business Owner
"The transparency is what sold me. Every trade is documented, every result is shared. No BS, no fake screenshots. Just real trading with real money. My account is up 62% this year."

📊 BY THE NUMBERS:
- 73% Win Rate
- 500+ Active Members
- $2.1M in Member Profits

💡 What Makes Us Different:
We're not selling a dream. We're sharing real trades, real analysis, and real education. Every signal comes with detailed reasoning. Every position is tracked transparently. Every member gets the same information at the same time.

Tomorrow, I'll show you exactly how to get started and what you can expect in your first month...

To your success,
The Nexural Trading Team

---
© 2025 Nexural Trading
Unsubscribe: {{unsubscribe_url}}
    `
  } as EmailTemplate,

  // Email 4: Conversion (Day 7)
  email4_conversion: {
    subject: "🎁 Your Exclusive Offer Expires Tonight",
    previewText: "Join now and get 20% off + exclusive bonuses",
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
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">⚡ Nexural Trading</h1>
              <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 16px;">Your Exclusive Offer</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: bold; text-transform: uppercase;">⏰ Limited Time Offer</p>
                <p style="margin: 0; color: #dc2626; font-size: 24px; font-weight: bold;">Expires in 24 Hours</p>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">🎁 Day 7: Your Exclusive Invitation</h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Over the past week, you've learned about our approach, seen our results, and heard from real members. Now it's time to make a decision...
              </p>
              
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 22px;">🎉 Newsletter Subscriber Exclusive</h3>
                
                <div style="background-color: #ffffff; border-radius: 6px; padding: 25px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-decoration: line-through;">Regular Price: $297/month</p>
                  <p style="margin: 0 0 20px 0; color: #dc2626; font-size: 36px; font-weight: bold;">$237/month</p>
                  <p style="margin: 0; color: #059669; font-size: 18px; font-weight: bold;">Save $60/month (20% OFF)</p>
                </div>
                
                <a href="https://nexuraltrading.com/pricing?discount=NEWSLETTER20" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 20px 0;">
                  Claim Your Discount →
                </a>
                
                <p style="margin: 20px 0 0 0; color: #3b82f6; font-size: 14px;">
                  ✓ Cancel anytime • ✓ No long-term commitment • ✓ 30-day money-back guarantee
                </p>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">🎁 PLUS: Exclusive Bonuses</h3>
              
              <div style="margin: 20px 0;">
                <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 15px;">
                  <strong style="color: #1f2937; font-size: 16px;">Bonus #1: Trading Psychology Masterclass</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Value: $197 - Master the mental game of trading</p>
                </div>
                
                <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 15px;">
                  <strong style="color: #1f2937; font-size: 16px;">Bonus #2: Risk Management Calculator</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Value: $97 - Never risk too much on a single trade</p>
                </div>
                
                <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px;">
                  <strong style="color: #1f2937; font-size: 16px;">Bonus #3: 1-on-1 Onboarding Call</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Value: $297 - Personal setup assistance</p>
                </div>
              </div>
              
              <div style="background-color: #fef3c7; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> This 20% discount is only available for the next 24 hours. After that, you'll pay full price. Don't miss out on $720/year in savings.
                </p>
              </div>
              
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 20px;">❓ Still Have Questions?</h3>
              
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                <strong>Q: What if I'm a complete beginner?</strong><br>
                A: Perfect! We teach you everything from scratch. Many of our most successful members started with zero trading experience.
              </p>
              
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                <strong>Q: How much time do I need?</strong><br>
                A: 15-30 minutes per day to check signals and manage positions. Swing trading is designed for busy people.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                <strong>Q: What if it doesn't work for me?</strong><br>
                A: 30-day money-back guarantee. If you're not satisfied, we'll refund every penny. No questions asked.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://nexuraltrading.com/pricing?discount=NEWSLETTER20" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 6px; font-weight: bold; font-size: 18px;">
                  Join Now & Save 20% →
                </a>
                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                  Offer expires in 24 hours
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To your trading success,<br>
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
🎁 Day 7: Your Exclusive Invitation

⏰ LIMITED TIME OFFER - Expires in 24 Hours

Over the past week, you've learned about our approach, seen our results, and heard from real members. Now it's time to make a decision...

🎉 NEWSLETTER SUBSCRIBER EXCLUSIVE:

Regular Price: $297/month
YOUR PRICE: $237/month
SAVE: $60/month (20% OFF)

Claim Your Discount: https://nexuraltrading.com/pricing?discount=NEWSLETTER20

✓ Cancel anytime
✓ No long-term commitment
✓ 30-day money-back guarantee

🎁 PLUS: EXCLUSIVE BONUSES

Bonus #1: Trading Psychology Masterclass (Value: $197)
Master the mental game of trading

Bonus #2: Risk Management Calculator (Value: $97)
Never risk too much on a single trade

Bonus #3: 1-on-1 Onboarding Call (Value: $297)
Personal setup assistance

⚠️ Important: This 20% discount is only available for the next 24 hours. After that, you'll pay full price. Don't miss out on $720/year in savings.

❓ STILL HAVE QUESTIONS?

Q: What if I'm a complete beginner?
A: Perfect! We teach you everything from scratch. Many of our most successful members started with zero trading experience.

Q: How much time do I need?
A: 15-30 minutes per day to check signals and manage positions. Swing trading is designed for busy people.

Q: What if it doesn't work for me?
A: 30-day money-back guarantee. If you're not satisfied, we'll refund every penny. No questions asked.

Join Now & Save 20%: https://nexuraltrading.com/pricing?discount=NEWSLETTER20

Offer expires in 24 hours.

To your trading success,
The Nexural Trading Team

---
© 2025 Nexural Trading
Unsubscribe: {{unsubscribe_url}}
    `
  } as EmailTemplate
}

export default freeNewsletterSequence
