import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { resolveSupabaseConfig } from '../config/supabase-env';
import { defaultSiteData } from './default-site.data';

@Injectable()
export class SiteService {
  private readonly mediaBucket = 'site-media';
  private readonly instagramVideoPath = 'instagram/featured-video';
  private readonly dataDir = join(process.cwd(), 'data');
  private readonly filePath = join(this.dataDir, 'site.json');
  private supabase: SupabaseClient | null = null;

  constructor(private config: ConfigService) {
    const env = this.config.get<Record<string, string | undefined>>('env') ?? {};
    const { url, serviceKey } = resolveSupabaseConfig({
      ...process.env,
      ...env,
    });

    this.supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
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

  async updateInstagramVideo(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Selecione um vídeo para enviar.');
    }

    const supportedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!supportedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Envie um vídeo MP4, WebM ou MOV.');
    }

    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('O vídeo deve ter no máximo 50 MB.');
    }

    if (!this.supabase) {
      throw new InternalServerErrorException(
        'O armazenamento de vídeos não está configurado.',
      );
    }

    const { error: bucketError } = await this.supabase.storage.getBucket(
      this.mediaBucket,
    );
    if (bucketError) {
      const { error: createBucketError } =
        await this.supabase.storage.createBucket(this.mediaBucket, {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024,
          allowedMimeTypes: supportedTypes,
        });
      if (createBucketError) {
        throw new InternalServerErrorException(
          `Não foi possível preparar o armazenamento do vídeo: ${createBucketError.message}`,
        );
      }
    }

    const { error: uploadError } = await this.supabase.storage
      .from(this.mediaBucket)
      .upload(this.instagramVideoPath, file.buffer, {
        cacheControl: '0',
        contentType: file.mimetype,
        upsert: true,
      });
    if (uploadError) {
      throw new InternalServerErrorException(
        `Não foi possível salvar o vídeo: ${uploadError.message}`,
      );
    }

    const publicUrl = this.supabase.storage
      .from(this.mediaBucket)
      .getPublicUrl(this.instagramVideoPath).data.publicUrl;
    const instagramVideoUrl = `${publicUrl}?v=${Date.now()}`;

    const { data, error: readError } = await this.supabase
      .from('site_data')
      .select('payload')
      .eq('id', 'singleton')
      .single();
    if (readError && readError.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        `Não foi possível ler os dados atuais do site: ${readError.message}`,
      );
    }

    const siteData = data?.payload ?? (await this.readFileData());
    const { error: saveError } = await this.supabase
      .from('site_data')
      .upsert(
        {
          id: 'singleton',
          payload: { ...siteData, instagramVideoUrl },
        },
        { onConflict: 'id' },
      );
    if (saveError) {
      throw new InternalServerErrorException(
        `O vídeo foi enviado, mas não foi possível salvar sua referência no site: ${saveError.message}`,
      );
    }

    return { instagramVideoUrl };
  }

  async getInstagramVideoDownload() {
    if (!this.supabase) {
      throw new NotFoundException('Nenhum vídeo enviado foi encontrado.');
    }

    const { data, error } = await this.supabase.storage
      .from(this.mediaBucket)
      .download(this.instagramVideoPath);
    if (error || !data) {
      throw new NotFoundException('Nenhum vídeo enviado foi encontrado.');
    }

    return {
      buffer: Buffer.from(await data.arrayBuffer()),
      contentType: data.type || 'video/mp4',
    };
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
