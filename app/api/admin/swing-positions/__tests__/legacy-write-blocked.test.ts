function createSwingLegacyReq(method: string, url: string, cookies: Record<string, string>) {
  return {
    method,
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

describe('/api/admin/swing-positions legacy write blocked', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    }

    // Mock supabase client used by requireAdmin() lookup.
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: '1', role: 'owner', is_active: true }, error: null }),
            }),
          }),
        }),
      }),
    }))
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('POST returns 410 (legacy write blocked)', async () => {
    const { POST } = await import('../route')
    const res = await POST(
      createSwingLegacyReq('POST', 'https://example.com/api/admin/swing-positions', {
        admin_authenticated: 'true',
        admin_session: '1',
      })
    )
    expect(res.status).toBe(410)
  })

  it('PUT returns 410 (legacy write blocked)', async () => {
    const { PUT } = await import('../route')
    const res = await PUT(
      createSwingLegacyReq('PUT', 'https://example.com/api/admin/swing-positions', {
        admin_authenticated: 'true',
        admin_session: '1',
      })
    )
    expect(res.status).toBe(410)
  })

  it('DELETE returns 410 (legacy write blocked)', async () => {
    const { DELETE } = await import('../route')
    const res = await DELETE(
      createSwingLegacyReq('DELETE', 'https://example.com/api/admin/swing-positions?id=1', {
        admin_authenticated: 'true',
        admin_session: '1',
      })
    )
    expect(res.status).toBe(410)
  })
})
