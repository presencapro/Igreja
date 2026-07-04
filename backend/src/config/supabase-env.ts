export interface SupabaseEnvConfig {
  url: string;
  serviceKey: string;
}

export interface SupabaseConfigOptions {
  useServiceRole?: boolean;
}

export function resolveSupabaseConfig(
  env: Record<string, string | undefined>,
  options: SupabaseConfigOptions = {},
): SupabaseEnvConfig {
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const useServiceRole = options.useServiceRole ?? true;
  const serviceKey = useServiceRole
    ? env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY
    : env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return { url, serviceKey };
}
