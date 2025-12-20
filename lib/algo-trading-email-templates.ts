// Email templates for Algo Trading Waitlist
// Integrates with existing lib/email-service.ts

export const algoTradingEmailTemplates = {
  // Waitlist confirmation email
  waitlistConfirmation: (data: {
    name: string
    position: number
    referralCode: string
    referralLink: string
  }) => ({
    subject: `You're on the Algo Trading Waitlist! Position #${data.position}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .position-badge { background: #3b82f6; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .position-number { font-size: 48px; font-weight: bold; }
          .referral-box { background: white; border: 2px solid #3b82f6; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .referral-code { font-size: 24px; font-weight: bold; color: #3b82f6; text-align: center; padding: 10px; background: #eff6ff; border-radius: 5px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .rewards { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to the Algo Trading Waitlist!</h1>
            <p>You're one step closer to automated trading</p>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Congratulations! You've successfully joined the Algo Trading waitlist.</p>
            
            <div class="position-badge">
              <div>Your Position</div>
              <div class="position-number">#${data.position}</div>
              <div>You're ahead of thousands of traders!</div>
            </div>
            
            <h2>🎁 Move Up Faster with Referrals</h2>
            <p>Share your unique referral link and jump ahead in line:</p>
            
            <div class="referral-box">
              <p><strong>Your Referral Code:</strong></p>
              <div class="referral-code">${data.referralCode}</div>
              <p style="margin-top: 15px;"><strong>Your Referral Link:</strong></p>
              <p style="word-break: break-all; font-size: 14px;">${data.referralLink}</p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="${data.referralLink}" class="button">Share Your Link</a>
              </div>
            </div>
            
            <h3>Referral Rewards:</h3>
            <div class="rewards">
              <p>✅ <strong>1 referral:</strong> Move up 5 spots + 50 points</p>
              <p>✅ <strong>5 referrals:</strong> Move up 15 spots + Active Referrer badge</p>
              <p>✅ <strong>10 referrals:</strong> Move up 30 spots + Top Referrer badge</p>
              <p>✅ <strong>20 referrals:</strong> Move up 50 spots + 33% lifetime discount!</p>
            </div>
            
            <h3>What's Next?</h3>
            <p>📅 <strong>Monthly Updates:</strong> Development progress and feature previews</p>
            <p>🧪 <strong>Beta Invitations (Q2 2026):</strong> Top members get early access</p>
            <p>🚀 <strong>Public Launch (Q4 2026):</strong> Full platform with all features</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal/algo-trading" class="button">View Your Dashboard</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/faq">FAQ page</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to the Algo Trading Waitlist!
      
      Hi ${data.name},
      
      You're now on the waitlist at position #${data.position}!
      
      Your Referral Code: ${data.referralCode}
      Your Referral Link: ${data.referralLink}
      
      Referral Rewards:
      - 1 referral: Move up 5 spots
      - 5 referrals: Move up 15 spots + badge
      - 10 referrals: Move up 30 spots + badge
      - 20 referrals: Move up 50 spots + 33% lifetime discount
      
      What's Next:
      - Monthly development updates
      - Beta invitations in Q2 2026
      - Public launch in Q4 2026
      
      View your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/member-portal/algo-trading
    `
  }),

  // Referral success email
  referralSuccess: (data: {
    name: string
    totalReferrals: number
    newPosition: number
    pointsEarned: number
  }) => ({
    subject: `🎉 New Referral! You're now at position #${data.newPosition}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .stat-item { display: inline-block; text-align: center; padding: 15px; margin: 10px; }
          .stat-number { font-size: 36px; font-weight: bold; color: #10b981; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Someone Used Your Referral!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Great news! Someone just joined the waitlist using your referral link.</p>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">${data.totalReferrals}</div>
                <div>Total Referrals</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">#${data.newPosition}</div>
                <div>New Position</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">+${data.pointsEarned}</div>
                <div>Points Earned</div>
              </div>
            </div>
            
            <p>Keep sharing to move up even faster and unlock more rewards!</p>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-portal/algo-trading" class="button">View Dashboard</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Someone Used Your Referral!
      
      Hi ${data.name},
      
      Great news! Someone just joined using your referral link.
      
      Your Stats:
      - Total Referrals: ${data.totalReferrals}
      - New Position: #${data.newPosition}
      - Points Earned: +${data.pointsEarned}
      
      View dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/member-portal/algo-trading
    `
  }),

  // Milestone achievement email
  milestoneAchieved: (data: {
    name: string
    milestone: number
    reward: string
    badge?: string
  }) => ({
    subject: `🏆 Milestone Achieved: ${data.milestone} Referrals!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .trophy { font-size: 80px; text-align: center; margin: 20px 0; }
          .reward-box { background: white; border: 3px solid #f59e0b; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Milestone Achieved!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <div class="trophy">🎉</div>
            <h2 style="text-align: center;">You've reached ${data.milestone} referrals!</h2>
            
            <div class="reward-box">
              <h3>Your Reward:</h3>
              <p style="font-size: 18px; font-weight: bold; color: #f59e0b;">${data.reward}</p>
              ${data.badge ? `<p style="font-size: 48px; margin: 20px 0;">${data.badge}</p>` : ''}
            </div>
            
            <p>You're crushing it! Keep sharing to unlock even more rewards.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Milestone Achieved!
      
      Hi ${data.name},
      
      Congratulations! You've reached ${data.milestone} referrals!
      
      Your Reward: ${data.reward}
      
      Keep sharing to unlock more rewards!
    `
  }),

  // Beta invitation email
  betaInvitation: (data: {
    name: string
    position: number
    inviteCode: string
  }) => ({
    subject: `🎉 You're Invited to Algo Trading Beta!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .invite-code { background: white; border: 2px solid #8b5cf6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #8b5cf6; letter-spacing: 2px; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Beta Access Granted!</h1>
            <p>You're one of the first to try Algo Trading</p>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Congratulations! Based on your position (#${data.position}) and engagement, you've been selected for our exclusive beta program.</p>
            
            <div class="invite-code">
              <p><strong>Your Beta Invite Code:</strong></p>
              <div class="code">${data.inviteCode}</div>
            </div>
            
            <h3>What's Included:</h3>
            <ul>
              <li>✅ Full access to Algo Trading platform</li>
              <li>✅ All pre-built strategies</li>
              <li>✅ Strategy builder tools</li>
              <li>✅ Priority support</li>
              <li>✅ Lifetime 33% discount ($199/month instead of $299)</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/algo-trading-beta/activate?code=${data.inviteCode}" class="button">Activate Beta Access</a>
            </div>
            
            <p><strong>Important:</strong> This invitation expires in 7 days. Activate now to secure your spot!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Beta Access Granted!
      
      Hi ${data.name},
      
      You've been selected for Algo Trading beta!
      
      Your Beta Code: ${data.inviteCode}
      
      What's Included:
      - Full platform access
      - All strategies
      - Priority support
      - Lifetime 33% discount
      
      Activate: ${process.env.NEXT_PUBLIC_APP_URL}/algo-trading-beta/activate?code=${data.inviteCode}
      
      Expires in 7 days!
    `
  })
}

// Helper function to send waitlist emails
export async function sendWaitlistEmail(
  type: keyof typeof algoTradingEmailTemplates,
  to: string,
  data: any
) {
  try {
    const template = algoTradingEmailTemplates[type](data)
    
    // TODO: Integrate with your existing email service
    // import { sendEmail } from './email-service'
    // await sendEmail({
    //   to,
    //   subject: template.subject,
    //   html: template.html,
    //   text: template.text
    // })
    
    console.log(`Sending ${type} email to ${to}`)
    return { success: true }
  } catch (error) {
    console.error(`Error sending ${type} email:`, error)
    return { success: false, error }
  }
}
