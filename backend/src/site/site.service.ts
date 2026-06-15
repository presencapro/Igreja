import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { defaultSiteData } from './default-site.data';

@Injectable()
export class SiteService {
  private readonly dataDir = join(process.cwd(), 'data');
  private readonly filePath = join(this.dataDir, 'site.json');
  private supabase: SupabaseClient | null = null;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const serviceKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (url && serviceKey) {
      this.supabase = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
  }

  async getSiteData() {
    const supabaseData = await this.getSiteDataFromSupabase();
    if (supabaseData) {
      return supabaseData;
    }

    return this.readFileData();
  }

  async updateSiteData(data: typeof defaultSiteData) {
    const saved = await this.updateSiteDataInSupabase(data);
    if (saved) {
      return saved;
    }

    await this.writeFileData(data);
    return data;
  }

  private async getSiteDataFromSupabase(): Promise<typeof defaultSiteData | null> {
    if (!this.supabase) {
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('site_data')
        .select('payload')
        .eq('id', 'singleton')
        .single();

      if (error) {
        return null;
      }

      return data?.payload ?? null;
    } catch {
      return null;
    }
  }

  private async updateSiteDataInSupabase(
    data: typeof defaultSiteData,
  ): Promise<typeof defaultSiteData | null> {
    if (!this.supabase) {
      return null;
    }

    try {
      const { error } = await this.supabase
        .from('site_data')
        .upsert({ id: 'singleton', payload: data }, { onConflict: 'id' });

      if (error) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private async readFileData() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as typeof defaultSiteData;
    } catch {
      await this.ensureDataDir();
      await this.writeFileData(defaultSiteData);
      return defaultSiteData;
    }
  }

  private async writeFileData(data: typeof defaultSiteData) {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async ensureDataDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }
}
