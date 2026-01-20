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
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user?.id) {
      return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    return { user: { id: data.user.id, email: data.user.email || undefined } }
  } catch {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}
