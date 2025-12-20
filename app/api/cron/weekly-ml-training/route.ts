import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

/**
 * Weekly ML Training Pipeline
 * Runs every Sunday at 2 AM
 * Triggered by Vercel Cron
 */
export async function GET(request: NextRequest) {
  console.log('🚀 Weekly ML Training Pipeline triggered')
  
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get project root
    const projectRoot = path.join(process.cwd())
    const scriptPath = path.join(projectRoot, 'scripts', 'weekly-ml-pipeline.py')
    
    console.log('📂 Project root:', projectRoot)
    console.log('📄 Script path:', scriptPath)
    
    // Set environment variables
    const env = {
      ...process.env,
      DATABENTO_API_KEY: process.env.DATABENTO_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      API_BASE_URL: process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3036'
    }
    
    console.log('🔧 Environment configured')
    console.log('🌐 API Base URL:', env.API_BASE_URL)
    
    // Execute pipeline script
    console.log('▶️  Starting pipeline execution...')
    
    const { stdout, stderr } = await execAsync(
      `python3 ${scriptPath}`,
      {
        cwd: projectRoot,
        env,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 3600000 // 1 hour timeout
      }
    )
    
    console.log('📊 Pipeline output:', stdout)
    
    if (stderr) {
      console.warn('⚠️  Pipeline warnings:', stderr)
    }
    
    // Parse results from output
    const success = !stdout.includes('PIPELINE FAILED')
    
    return NextResponse.json({
      success,
      message: success 
        ? 'Weekly ML training pipeline completed successfully'
        : 'Weekly ML training pipeline completed with errors',
      timestamp: new Date().toISOString(),
      output: stdout,
      warnings: stderr || null
    })
    
  } catch (error: any) {
    console.error('❌ Pipeline execution failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      details: {
        stdout: error.stdout || null,
        stderr: error.stderr || null
      }
    }, { status: 500 })
  }
}

/**
 * Manual trigger endpoint (POST)
 * Allows manual execution of the pipeline
 */
export async function POST(request: NextRequest) {
  console.log('🔧 Manual pipeline trigger requested')
  
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin token required' },
        { status: 401 }
      )
    }
    
    // Call GET handler
    return GET(request)
    
  } catch (error: any) {
    console.error('❌ Manual trigger failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Export runtime config for Vercel
export const runtime = 'nodejs'
export const maxDuration = 3600 // 1 hour max execution time
