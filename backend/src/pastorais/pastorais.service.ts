import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { resolveSupabaseConfig } from '../config/supabase-env';
import {
  defaultPastoraisData,
  PastoraisData,
  Pastoral,
  PastoralInscricao,
  PastoralPost,
} from './default-pastorais.data';

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

@Injectable()
export class PastoraisService {
  private readonly dataDir = join(process.cwd(), 'data');
  private readonly filePath = join(this.dataDir, 'pastorais.json');
  private supabase: SupabaseClient | null = null;
  private readonly secret: string;

  constructor(private config: ConfigService) {
    const env =
      this.config.get<Record<string, string | undefined>>('env') ?? {};
    const { url, serviceKey } = resolveSupabaseConfig({
      ...process.env,
      ...env,
    });

    this.supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    this.secret =
      process.env.PASTORAL_TOKEN_SECRET ??
      env.PASTORAL_TOKEN_SECRET ??
      'igreja-pastoral-dev-secret-change-me';
  }

  // ==================== Dados ====================

  async getData(): Promise<PastoraisData> {
    const supabaseData = await this.getDataFromSupabase();
    if (supabaseData) {
      return supabaseData;
    }
    return this.readFileData();
  }

  async saveData(data: PastoraisData): Promise<PastoraisData> {
    const saved = await this.saveDataInSupabase(data);
    if (saved) {
      return saved;
    }
    await this.writeFileData(data);
    return data;
  }

  private async getDataFromSupabase(): Promise<PastoraisData | null> {
    if (!this.supabase) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from('pastorais_data')
        .select('payload')
        .eq('id', 'singleton')
        .single();
      if (error) {
        return null;
      }
      return (data?.payload as PastoraisData) ?? null;
    } catch {
      return null;
    }
  }

  private async saveDataInSupabase(
    data: PastoraisData,
  ): Promise<PastoraisData | null> {
    if (!this.supabase) {
      return null;
    }
    try {
      const { error } = await this.supabase
        .from('pastorais_data')
        .upsert({ id: 'singleton', payload: data }, { onConflict: 'id' });
      if (error) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  private async readFileData(): Promise<PastoraisData> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as PastoraisData;
    } catch {
      await this.ensureDataDir();
      await this.writeFileData(defaultPastoraisData);
      return defaultPastoraisData;
    }
  }

  private async writeFileData(data: PastoraisData) {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async ensureDataDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  // ==================== Pastorais ====================

  async listPastorais() {
    const data = await this.getData();
    return data.pastorais.map((p) => this.toPublicPastoral(p));
  }

  async findPastoralById(id: string): Promise<Pastoral | null> {
    const data = await this.getData();
    return data.pastorais.find((p) => p.id === id) ?? null;
  }

  async findPastoralBySlug(slug: string): Promise<Pastoral | null> {
    const data = await this.getData();
    return data.pastorais.find((p) => p.slug === slug) ?? null;
  }

  async resolvePastoral(idOrSlug: string): Promise<Pastoral | null> {
    return (
      (await this.findPastoralById(idOrSlug)) ??
      (await this.findPastoralBySlug(idOrSlug))
    );
  }

  async getPastoralPublic(idOrSlug: string) {
    const pastoral = await this.resolvePastoral(idOrSlug);
    if (!pastoral) {
      return null;
    }
    return this.toPublicPastoral(pastoral, true);
  }

  async createPastoral(input: {
    name: string;
    description?: string;
    imageUrl?: string;
    coordinator?: string;
    contact?: string;
    email?: string;
    password?: string;
  }): Promise<Pastoral> {
    const data = await this.getData();
    const name = input.name.trim();
    const pastoral: Pastoral = {
      id: randomUUID(),
      name,
      slug: this.slugify(name),
      description: input.description?.trim() || '',
      imageUrl: input.imageUrl?.trim() || '',
      coordinator: input.coordinator?.trim() || '',
      contact: input.contact?.trim() || '',
      email: input.email?.trim().toLowerCase() || '',
      passwordHash: input.password
        ? this.hashPassword(input.password)
        : undefined,
      createdAt: new Date().toISOString(),
      posts: [],
      inscricoes: [],
    };
    data.pastorais.push(pastoral);
    await this.saveData(data);
    return pastoral;
  }

  async updatePastoral(
    id: string,
    input: {
      name?: string;
      description?: string;
      imageUrl?: string;
      coordinator?: string;
      contact?: string;
      email?: string;
      password?: string;
    },
  ): Promise<Pastoral | null> {
    const data = await this.getData();
    const pastoral = data.pastorais.find((p) => p.id === id);
    if (!pastoral) {
      return null;
    }
    if (input.name) {
      pastoral.name = input.name.trim();
      pastoral.slug = this.slugify(pastoral.name);
    }
    if (input.description !== undefined)
      pastoral.description = input.description.trim();
    if (input.imageUrl !== undefined) pastoral.imageUrl = input.imageUrl.trim();
    if (input.coordinator !== undefined)
      pastoral.coordinator = input.coordinator.trim();
    if (input.contact !== undefined) pastoral.contact = input.contact.trim();
    if (input.email !== undefined)
      pastoral.email = input.email.trim().toLowerCase();
    if (input.password)
      pastoral.passwordHash = this.hashPassword(input.password);
    await this.saveData(data);
    return pastoral;
  }

  async deletePastoral(id: string): Promise<boolean> {
    const data = await this.getData();
    const before = data.pastorais.length;
    data.pastorais = data.pastorais.filter((p) => p.id !== id);
    if (data.pastorais.length === before) {
      return false;
    }
    await this.saveData(data);
    return true;
  }

  // ==================== Posts ====================

  async addPost(
    pastoralId: string,
    input: {
      title: string;
      content?: string;
      images?: string[];
      eventDate?: string;
    },
  ): Promise<PastoralPost | null> {
    const data = await this.getData();
    const pastoral = data.pastorais.find((p) => p.id === pastoralId);
    if (!pastoral) {
      return null;
    }
    const post: PastoralPost = {
      id: randomUUID(),
      title: input.title.trim(),
      content: input.content?.trim() || '',
      images: Array.isArray(input.images)
        ? input.images.filter((i) => typeof i === 'string' && i.trim())
        : [],
      eventDate: input.eventDate || '',
      createdAt: new Date().toISOString(),
    };
    pastoral.posts.unshift(post);
    await this.saveData(data);
    return post;
  }

  async updatePost(
    pastoralId: string,
    postId: string,
    input: {
      title?: string;
      content?: string;
      images?: string[];
      eventDate?: string;
    },
  ): Promise<PastoralPost | null> {
    const data = await this.getData();
    const pastoral = data.pastorais.find((p) => p.id === pastoralId);
    if (!pastoral) {
      return null;
    }
    const post = pastoral.posts.find((pt) => pt.id === postId);
    if (!post) {
      return null;
    }
    if (input.title !== undefined) post.title = input.title.trim();
    if (input.content !== undefined) post.content = input.content.trim();
    if (input.images !== undefined)
      post.images = input.images.filter(
        (i) => typeof i === 'string' && i.trim(),
      );
    if (input.eventDate !== undefined) post.eventDate = input.eventDate;
    await this.saveData(data);
    return post;
  }

  async deletePost(pastoralId: string, postId: string): Promise<boolean> {
    const data = await this.getData();
    const pastoral = data.pastorais.find((p) => p.id === pastoralId);
    if (!pastoral) {
      return false;
    }
    const before = pastoral.posts.length;
    pastoral.posts = pastoral.posts.filter((pt) => pt.id !== postId);
    if (pastoral.posts.length === before) {
      return false;
    }
    await this.saveData(data);
    return true;
  }

  // ==================== Inscrições ====================

  async addInscricao(
    pastoralId: string,
    input: { name: string; email?: string; phone?: string; message?: string },
  ): Promise<PastoralInscricao | null> {
    const data = await this.getData();
    const pastoral = data.pastorais.find((p) => p.id === pastoralId);
    if (!pastoral) {
      return null;
    }
    const inscricao: PastoralInscricao = {
      id: randomUUID(),
      name: input.name.trim(),
      email: input.email?.trim() || '',
      phone: input.phone?.trim() || '',
      message: input.message?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    pastoral.inscricoes.push(inscricao);
    await this.saveData(data);
    return inscricao;
  }

  async listInscricoes(pastoralId: string): Promise<PastoralInscricao[]> {
    const pastoral = await this.findPastoralById(pastoralId);
    return pastoral?.inscricoes ?? [];
  }

  async deleteInscricao(
    pastoralId: string,
    inscricaoId: string,
  ): Promise<boolean> {
    const data = await this.getData();
    const pastoral = data.pastorais.find((p) => p.id === pastoralId);
    if (!pastoral) {
      return false;
    }
    const before = pastoral.inscricoes.length;
    pastoral.inscricoes = pastoral.inscricoes.filter(
      (i) => i.id !== inscricaoId,
    );
    if (pastoral.inscricoes.length === before) {
      return false;
    }
    await this.saveData(data);
    return true;
  }

  // ==================== Auth ====================

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) {
      return false;
    }
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return (
      candidate.length === expected.length &&
      timingSafeEqual(candidate, expected)
    );
  }

  async login(email: string, password: string) {
    const data = await this.getData();
    const pastoral = data.pastorais.find(
      (p) => p.email && p.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (
      !pastoral ||
      !pastoral.passwordHash ||
      !this.verifyPassword(password, pastoral.passwordHash)
    ) {
      return null;
    }
    const token = this.signToken(pastoral.id);
    return { token, pastoral: this.toPublicPastoral(pastoral, true) };
  }

  verifyToken(token: string): string | null {
    try {
      const [payload, signature] = token.split('.');
      if (!payload || !signature) {
        return null;
      }
      const expected = Buffer.from(
        createHmac('sha256', this.secret).update(payload).digest('base64url'),
      );
      const received = Buffer.from(signature);
      if (
        expected.length !== received.length ||
        !timingSafeEqual(expected, received)
      ) {
        return null;
      }
      const decoded = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf-8'),
      ) as {
        sub?: string;
        exp?: number;
      };
      if (!decoded.sub || !decoded.exp || decoded.exp < Date.now()) {
        return null;
      }
      return decoded.sub;
    } catch {
      return null;
    }
  }

  private signToken(pastoralId: string): string {
    const payload = Buffer.from(
      JSON.stringify({ sub: pastoralId, exp: Date.now() + TOKEN_TTL_MS }),
    ).toString('base64url');
    const signature = createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64url');
    return `${payload}.${signature}`;
  }

  private toPublicPastoral(p: Pastoral, includePosts = false) {
    const { inscricoes, posts, ...rest } = p;
    delete rest.passwordHash;
    return {
      ...rest,
      postsCount: posts.length,
      inscricoesCount: includePosts ? inscricoes.length : undefined,
      posts: includePosts ? posts : undefined,
    };
  }

  private slugify(text: string): string {
    const base = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    return `${base}-${randomBytes(3).toString('hex')}`;
  }
}
