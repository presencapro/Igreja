import { resolveSupabaseConfig } from './supabase-env';

describe('resolveSupabaseConfig', () => {
  it('uses the backend SUPABASE variables when present', () => {
    const config = resolveSupabaseConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key',
    });

    expect(config).toEqual({
      url: 'https://example.supabase.co',
      serviceKey: 'service-key',
    });
  });

  it('falls back to the frontend VITE variables when backend variables are missing', () => {
    const config = resolveSupabaseConfig({
      VITE_SUPABASE_URL: 'https://vite.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    });

    expect(config).toEqual({
      url: 'https://vite.supabase.co',
      serviceKey: 'anon-key',
    });
  });

  it('uses the anonymous key for auth login flows when requested', () => {
    const config = resolveSupabaseConfig(
      {
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-key',
        SUPABASE_ANON_KEY: 'anon-key',
      },
      { useServiceRole: false },
    );

    expect(config).toEqual({
      url: 'https://example.supabase.co',
      serviceKey: 'anon-key',
    });
  });
});
