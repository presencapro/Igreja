import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private emailDomain: string;
  private allowedDomains: string[];

  constructor(private config: ConfigService) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const serviceKey = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.emailDomain = this.config.get<string>('EMAIL_DOMAIN') ?? 'paroquia.internal';
    this.allowedDomains = this.config
      .get<string>('ALLOWED_DOMAINS')
      ?.split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean) ?? [this.emailDomain];

    if (!this.allowedDomains.includes(this.emailDomain)) {
      this.allowedDomains.unshift(this.emailDomain);
    }

    this.supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  private getAuthEmail(payload: Partial<LoginDto>) {
    const email = payload.email?.trim().toLowerCase();
    if (!email) {
      return null;
    }
    if (!this.isAllowedDomain(email)) {
      throw new UnauthorizedException(
        `Email não pertence a um domínio permitido. Use um email de: ${this.allowedDomains.join(', ')}`,
      );
    }

    return email;
  }

  private isAllowedDomain(email: string) {
    return this.allowedDomains.some((domain) => email.endsWith(`@${domain}`));
  }

  async login({ email, password }: LoginDto) {
    const authEmail = this.getAuthEmail({ email });

    if (!authEmail || !password?.trim()) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error || !data.session || !data.user?.email) {
      console.error('Supabase login error:', error);
      throw new UnauthorizedException(error?.message ?? 'Usuário ou senha inválidos.');
    }

    const userEmail = data.user.email.toLowerCase();
    if (!this.isAllowedDomain(userEmail)) {
      throw new UnauthorizedException('Acesso permitido apenas para o domínio autorizado.');
    }

    return {
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'admin',
      },
    };
  }

  async me(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user?.email) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }

    const userEmail = data.user.email.toLowerCase();
    if (!this.isAllowedDomain(userEmail)) {
      throw new UnauthorizedException('Acesso permitido apenas para o domínio autorizado.');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      role: 'admin',
    };
  }
}
