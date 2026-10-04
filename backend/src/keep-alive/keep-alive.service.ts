import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resolveSupabaseConfig } from '../config/supabase-env';

@Injectable()
export class KeepAliveService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService) {
    const env = config.get<Record<string, string | undefined>>('env') ?? {};
    const { url, serviceKey } = resolveSupabaseConfig({
      ...process.env,
      ...env,
    });

    this.supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async pingSupabase(): Promise<void> {
    const { error } = await this.supabase
      .from('site_data')
      .select('id')
      .limit(1);

    if (error) {
      throw new InternalServerErrorException(
        'The keep-alive query to Supabase failed.',
      );
    }
  }
}
