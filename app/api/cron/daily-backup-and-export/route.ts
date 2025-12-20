/**
 * DAILY BACKUP AND EXPORT CRON JOB
 * Runs at 2 AM daily to:
 * 1. Export yesterday's market data to CSV
 * 2. Backup all database tables
 * 3. Upload to Backblaze B2
 * 4. Send email notification
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBackupService } from '@/lib/database-backup-complete'
import { getMarketDataExporter } from '@/lib/market-data-exporter'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('\n🕐 DAILY BACKUP AND EXPORT JOB STARTED')
  console.log('='.repeat(80))
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('='.repeat(80))

  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    marketDataExport: null as any,
    databaseBackup: null as any,
    errors: [] as string[]
  }

  try {
    // Step 1: Export yesterday's market data
    console.log('\n📊 STEP 1: Exporting Market Data...\n')
    const exporter = getMarketDataExporter()
    const exportResult = await exporter.exportDailyData()
    results.marketDataExport = {
      success: exportResult.success,
      symbols: Object.keys(exportResult.symbols).length,
      totalRows: exportResult.totalRows,
      totalSize: exportResult.totalSize,
      duration: exportResult.duration,
      errors: exportResult.errors
    }

    if (!exportResult.success) {
      results.errors.push('Market data export failed')
    }

    // Step 2: Backup database
    console.log('\n💾 STEP 2: Backing Up Database...\n')
    const backupService = getBackupService()
    const backupResult = await backupService.performBackup()
    results.databaseBackup = {
      success: backupResult.success,
      tables: Object.keys(backupResult.tables).length,
      totalRows: Object.values(backupResult.tables).reduce((sum: number, t: any) => sum + t.rowCount, 0),
      totalSize: backupResult.totalSize,
      duration: backupResult.duration,
      localPath: backupResult.localPath,
      backblazeUrl: backupResult.backblazeUrl,
      errors: backupResult.errors
    }

    if (!backupResult.success) {
      results.errors.push('Database backup failed')
      results.success = false
    }

    // Step 3: Send notification email (if configured)
    if (process.env.ADMIN_EMAIL) {
      console.log('\n📧 STEP 3: Sending Notification Email...\n')
      await sendNotificationEmail(results)
    }

    console.log('\n' + '='.repeat(80))
    console.log('✅ DAILY BACKUP AND EXPORT JOB COMPLETE!')
    console.log(`   Market Data: ${results.marketDataExport.success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`   Database Backup: ${results.databaseBackup.success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`   Total Duration: ${((results.marketDataExport.duration + results.databaseBackup.duration) / 1000).toFixed(2)}s`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: results.success,
      message: 'Daily backup and export completed',
      results
    })

  } catch (error: any) {
    console.error('❌ Cron job failed:', error)
    results.success = false
    results.errors.push(error.message)

    // Try to send error notification
    if (process.env.ADMIN_EMAIL) {
      await sendErrorNotification(error)
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}

/**
 * Send success notification email
 */
async function sendNotificationEmail(results: any): Promise<void> {
  try {
    const subject = results.success 
      ? '✅ Daily Backup Successful' 
      : '⚠️ Daily Backup Completed with Errors'

    const body = `
Daily Backup and Export Report
${new Date().toLocaleString()}

MARKET DATA EXPORT:
- Status: ${results.marketDataExport.success ? '✅ Success' : '❌ Failed'}
- Symbols: ${results.marketDataExport.symbols}
- Total Rows: ${results.marketDataExport.totalRows}
- Size: ${(results.marketDataExport.totalSize / 1024 / 1024).toFixed(2)} MB
- Duration: ${(results.marketDataExport.duration / 1000).toFixed(2)}s
${results.marketDataExport.errors.length > 0 ? `- Errors: ${results.marketDataExport.errors.join(', ')}` : ''}

DATABASE BACKUP:
- Status: ${results.databaseBackup.success ? '✅ Success' : '❌ Failed'}
- Tables: ${results.databaseBackup.tables}
- Total Rows: ${results.databaseBackup.totalRows}
- Size: ${(results.databaseBackup.totalSize / 1024 / 1024).toFixed(2)} MB
- Duration: ${(results.databaseBackup.duration / 1000).toFixed(2)}s
- Local Path: ${results.databaseBackup.localPath}
- Backblaze: ${results.databaseBackup.backblazeUrl || 'Not uploaded'}
${results.databaseBackup.errors.length > 0 ? `- Errors: ${results.databaseBackup.errors.join(', ')}` : ''}

${results.errors.length > 0 ? `\nOVERALL ERRORS:\n${results.errors.join('\n')}` : ''}
    `.trim()

    // TODO: Implement actual email sending
    console.log('   📧 Email notification prepared (email service not configured)')
    console.log(`   Subject: ${subject}`)

  } catch (error) {
    console.error('   ⚠️ Failed to send notification email:', error)
  }
}

/**
 * Send error notification email
 */
async function sendErrorNotification(error: Error): Promise<void> {
  try {
    const subject = '❌ Daily Backup Failed'
    const body = `
Daily Backup and Export FAILED
${new Date().toLocaleString()}

ERROR:
${error.message}

STACK TRACE:
${error.stack}

Please check the system immediately.
    `.trim()

    // TODO: Implement actual email sending
    console.log('   📧 Error notification prepared (email service not configured)')
    console.log(`   Subject: ${subject}`)

  } catch (err) {
    console.error('   ⚠️ Failed to send error notification:', err)
  }
}
