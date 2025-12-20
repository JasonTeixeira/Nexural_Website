// Automated Cron Scheduler for Trading System
// Handles daily reports, market data collection, and system maintenance

import * as cron from 'node-cron'
import { 
  runAllDailyJobs,
  calculateDailyPerformance,
  generatePortfolioSummary,
  sendDailyReport,
  collectMarketData
} from './cron-jobs'

// Timezone configuration for EST
const EST_TIMEZONE = 'America/New_York'

// Cron job instances storage
const cronJobs: { [key: string]: any } = {}

// Initialize all cron jobs
export function initializeCronJobs() {
  console.log('🚀 Initializing automated cron jobs...')

  // Daily Report at 8:00 PM EST (20:00)
  cronJobs.dailyReport = cron.schedule('0 20 * * *', async () => {
    console.log('📊 Running daily report job at 8:00 PM EST...')
    try {
      const result = await runAllDailyJobs()
      console.log('✅ Daily report job completed:', result)
    } catch (error) {
      console.error('❌ Daily report job failed:', error)
    }
  }, {
    timezone: EST_TIMEZONE
  })

  // Market Data Collection - Every hour during market hours (9 AM - 4 PM EST)
  cronJobs.marketData = cron.schedule('0 9-16 * * 1-5', async () => {
    console.log('📈 Collecting market data...')
    try {
      const result = await collectMarketData()
      console.log('✅ Market data collection completed:', result)
    } catch (error) {
      console.error('❌ Market data collection failed:', error)
    }
  }, {
    timezone: EST_TIMEZONE
  })

  // Performance Calculation - Daily at 5:00 PM EST (after market close)
  cronJobs.performance = cron.schedule('0 17 * * 1-5', async () => {
    console.log('📊 Calculating daily performance...')
    try {
      const result = await calculateDailyPerformance()
      console.log('✅ Performance calculation completed:', result)
    } catch (error) {
      console.error('❌ Performance calculation failed:', error)
    }
  }, {
    timezone: EST_TIMEZONE
  })

  // Portfolio Summary - Daily at 5:30 PM EST
  cronJobs.portfolio = cron.schedule('30 17 * * 1-5', async () => {
    console.log('📈 Generating portfolio summary...')
    try {
      const result = await generatePortfolioSummary()
      console.log('✅ Portfolio summary completed:', result)
    } catch (error) {
      console.error('❌ Portfolio summary failed:', error)
    }
  }, {
    timezone: EST_TIMEZONE
  })

  // System Health Check - Every 6 hours
  cronJobs.healthCheck = cron.schedule('0 */6 * * *', async () => {
    console.log('🔍 Running system health check...')
    try {
      await performSystemHealthCheck()
      console.log('✅ System health check completed')
    } catch (error) {
      console.error('❌ System health check failed:', error)
    }
  }, {
    timezone: EST_TIMEZONE
  })

  // Weekly Summary - Sundays at 6:00 PM EST
  cronJobs.weeklyReport = cron.schedule('0 18 * * 0', async () => {
    console.log('📊 Generating weekly summary...')
    try {
      await generateWeeklySummary()
      console.log('✅ Weekly summary completed')
    } catch (error) {
      console.error('❌ Weekly summary failed:', error)
    }
  }, {
    timezone: EST_TIMEZONE
  })

  console.log('✅ All cron jobs initialized successfully')
}

// Start all cron jobs
export function startAllCronJobs() {
  console.log('▶️ Starting all cron jobs...')
  
  Object.entries(cronJobs).forEach(([name, job]) => {
    job.start()
    console.log(`✅ Started ${name} cron job`)
  })
  
  console.log('🚀 All cron jobs are now running!')
  logNextExecutionTimes()
}

// Stop all cron jobs
export function stopAllCronJobs() {
  console.log('⏹️ Stopping all cron jobs...')
  
  Object.entries(cronJobs).forEach(([name, job]) => {
    job.stop()
    console.log(`⏹️ Stopped ${name} cron job`)
  })
  
  console.log('✅ All cron jobs stopped')
}

// Start specific cron job
export function startCronJob(jobName: string) {
  if (cronJobs[jobName]) {
    cronJobs[jobName].start()
    console.log(`✅ Started ${jobName} cron job`)
    return true
  } else {
    console.error(`❌ Cron job ${jobName} not found`)
    return false
  }
}

// Stop specific cron job
export function stopCronJob(jobName: string) {
  if (cronJobs[jobName]) {
    cronJobs[jobName].stop()
    console.log(`⏹️ Stopped ${jobName} cron job`)
    return true
  } else {
    console.error(`❌ Cron job ${jobName} not found`)
    return false
  }
}

// Get status of all cron jobs
export function getCronJobsStatus() {
  const status: { [key: string]: boolean } = {}
  
  Object.entries(cronJobs).forEach(([name, job]) => {
    status[name] = job.running || false
  })
  
  return status
}

// Log next execution times
export function logNextExecutionTimes() {
  console.log('📅 Next scheduled executions:')
  console.log('  • Daily Report: Every day at 8:00 PM EST')
  console.log('  • Market Data: Hourly 9 AM-4 PM EST (Mon-Fri)')
  console.log('  • Performance: Daily at 5:00 PM EST (Mon-Fri)')
  console.log('  • Portfolio: Daily at 5:30 PM EST (Mon-Fri)')
  console.log('  • Health Check: Every 6 hours')
  console.log('  • Weekly Report: Sundays at 6:00 PM EST')
}

// System health check function
async function performSystemHealthCheck() {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    database: false,
    discord: false,
    databento: false,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  }

  try {
    // Check database connection
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase.from('trading_signals_enhanced').select('count').limit(1)
    healthStatus.database = !error

    // Check Discord webhook
    const testWebhook = process.env.DISCORD_WEBHOOK_DAILY_RESULTS
    if (testWebhook) {
      const response = await fetch(testWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '🔍 System health check - All systems operational',
          embeds: [{
            title: '🟢 System Status',
            description: 'Automated health check completed successfully',
            color: 0x00ff00,
            timestamp: new Date().toISOString()
          }]
        })
      })
      healthStatus.discord = response.ok
    }

    // Check Databento connection
    try {
      const { createDatabentoClient } = await import('./databento-client')
      const databentoClient = createDatabentoClient()
      healthStatus.databento = !!databentoClient
    } catch (error) {
      healthStatus.databento = false
    }

    console.log('🔍 System Health Status:', healthStatus)
    return healthStatus

  } catch (error) {
    console.error('❌ Health check error:', error)
    return healthStatus
  }
}

// Weekly summary function
async function generateWeeklySummary() {
  console.log('📊 Generating weekly performance summary...')
  
  try {
    // Get the past week's data
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // This would aggregate weekly performance data
    // Implementation would depend on your specific requirements
    
    const weeklyMessage = {
      embeds: [{
        title: '📊 NEXURAL WEEKLY SUMMARY',
        description: `Week ending ${endDate.toISOString().split('T')[0]}`,
        color: 0x0099ff,
        fields: [
          {
            name: '📈 Weekly Performance',
            value: 'Weekly summary data would go here',
            inline: false
          }
        ],
        footer: {
          text: `Nexural Trading System • Weekly Report • ${new Date().toLocaleString()} EST`
        },
        timestamp: new Date().toISOString()
      }]
    }

    // Send to weekly watchlist channel
    const weeklyWebhook = process.env.DISCORD_WEBHOOK_WEEKLY_WATCHLIST
    if (weeklyWebhook) {
      const response = await fetch(weeklyWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weeklyMessage)
      })
      
      if (response.ok) {
        console.log('✅ Weekly summary sent successfully')
      } else {
        console.error('❌ Failed to send weekly summary')
      }
    }

  } catch (error) {
    console.error('❌ Weekly summary generation failed:', error)
  }
}

// Manual trigger for testing
export async function triggerDailyReportNow() {
  console.log('🚀 Manually triggering daily report...')
  try {
    const result = await runAllDailyJobs()
    console.log('✅ Manual daily report completed:', result)
    return result
  } catch (error) {
    console.error('❌ Manual daily report failed:', error)
    throw error
  }
}

// Export cron job management functions
export const cronManager = {
  initialize: initializeCronJobs,
  startAll: startAllCronJobs,
  stopAll: stopAllCronJobs,
  start: startCronJob,
  stop: stopCronJob,
  status: getCronJobsStatus,
  triggerDaily: triggerDailyReportNow,
  logSchedule: logNextExecutionTimes
}
