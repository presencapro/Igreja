import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { defaultSiteData } from './default-site.data';

@Injectable()
export class SiteService {
  private readonly dataDir = join(process.cwd(), 'data');
  private readonly filePath = join(this.dataDir, 'site.json');

  async getSiteData() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as typeof defaultSiteData;
    } catch {
      await this.ensureDataDir();
      await fs.writeFile(
        this.filePath,
        JSON.stringify(defaultSiteData, null, 2),
        'utf-8',
      );
      return defaultSiteData;
    }
  }

  async updateSiteData(data: typeof defaultSiteData) {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }

  private async ensureDataDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }
}
