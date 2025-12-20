import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/error-handler';
import { TwoFactorAuthService } from '@/lib/two-factor-auth-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setup = await TwoFactorAuthService.setup(user.id, user.email!);
    
    return NextResponse.json(setup);
  } catch (error) {
    return createErrorResponse(error);
  }
}
