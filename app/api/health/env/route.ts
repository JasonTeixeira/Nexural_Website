import { NextResponse } from 'next/server'

/**
 * Safe environment sanity endpoint (SSOT ops aid).
 * 
 * Returns presence (not values) for auth-critical env vars.
 * This helps diagnose "client_id=undefined" / OAuth misconfig quickly in prod.
 */
export async function GET() {
  const required = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_SECRET_KEY',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_SECRET_KEY',
  ]

  const present: Record<string, boolean> = {}
  for (const k of required) present[k] = !!process.env[k]

  return NextResponse.json(
    {
      ok: true,
      present,
      node_env: process.env.NODE_ENV,
      hint:
        'This endpoint only returns which variables are present. Set missing keys in Vercel Environment Variables and redeploy.',
    },
    { status: 200 }
  )
}

