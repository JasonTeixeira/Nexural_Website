function createReq(url: string, cookies: Record<string, string>) {
  return {
    url,
    headers: new Headers(),
    cookies: {
      get: (name: string) => {
        const value = cookies[name]
        return value ? { value } : undefined
      },
    },
  } as any
}

describe('/api/admin/deletion-gates cookie auth', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('returns 401 when neither bearer token nor admin cookies are present', async () => {
    // Mock supabase client imported by server-session-service at module load.
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: () => ({ from: () => ({ insert: async () => ({}) }) }),
    }))

    const { GET } = await import('../route')
    const res = await GET(createReq('https://example.com/api/admin/deletion-gates?days=1', {}))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('allows access when admin_authenticated=true and admin_session are present', async () => {
    // Mock supabase client used inside the route
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: () => ({
        from: () => ({
          select: () => ({
            gte: () => ({
              limit: async () => ({ data: [{ tag: 'ops.deletion_gate_test', created_at: new Date().toISOString() }], error: null }),
            }),
          }),
        }),
      }),
    }))

    const { GET: GET2 } = await import('../route')
    const res = await GET2(
      createReq('https://example.com/api/admin/deletion-gates?days=1', {
        admin_authenticated: 'true',
        admin_session: '4',
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.counts['ops.deletion_gate_test']).toBe(1)
  })
})
