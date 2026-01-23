import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type AuthedUser = {
  id: string
  email?: string
}

/**
 * For Route Handlers: require a Supabase-authenticated user.
 * Returns either `{ user }` or `{ response }` to early-return.
 */
export async function requireSupabaseUser(): Promise<
  | { user: AuthedUser; response?: never }
  | { response: NextResponse; user?: never }
> {
  try {
    const supabase = await createClient()
    // Support both cookie-based auth (normal browser flow) and explicit
    // Authorization header (useful for API clients/tests).
    //
    // NOTE: This runs in Route Handlers, not Server Components.
    // Using `next/headers` is supported here.
    const { headers } = await import('next/headers')
    const authHeader = headers().get('authorization') || headers().get('Authorization')

    const { data, error } = authHeader
      ? await supabase.auth.getUser(authHeader.replace(/^Bearer\s+/i, '').trim())
      : await supabase.auth.getUser()
    if (error || !data?.user?.id) {
      return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    return { user: { id: data.user.id, email: data.user.email || undefined } }
  } catch {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}
