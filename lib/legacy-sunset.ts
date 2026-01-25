import { NextResponse } from 'next/server'

export function legacySunsetResponse(replacement?: string) {
  return NextResponse.json(
    {
      error: 'Legacy endpoint',
      message:
        'This endpoint is deprecated per SSOT. Use canonical SSOT endpoints instead.',
      replacement: replacement || null,
      status: 410,
    },
    { status: 410 }
  )
}
