import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private emailDomain: string;

  constructor(private config: ConfigService) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const serviceKey = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.emailDomain = this.config.get<string>('EMAIL_DOMAIN') ?? 'paroquia.internal';

    this.supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  private getAuthEmail(payload: LoginDto) {
    if (payload.email) {
      return payload.email.trim().toLowerCase();
    }

    if (payload.username) {
      return `${payload.username.trim().toLowerCase()}@${this.emailDomain}`;
    }

    return null;
  }

  private async isAdminEmail(email: string) {
    const { data, error } = await this.supabase
      .from('admin_users')
      .select('auth_id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    return !error && !!data;
  }

  async login({ email, username, password }: LoginDto) {
    const authEmail = this.getAuthEmail({ email, username, password });

    if (!authEmail || !password?.trim()) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error || !data.session || !data.user?.email) {
      console.error('Erro detalhado do Supabase:', error?.message);
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const isAdmin = await this.isAdminEmail(data.user.email);
    if (!isAdmin) {
      throw new UnauthorizedException('Acesso não autorizado.');
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

    const isAdmin = await this.isAdminEmail(data.user.email);
    if (!isAdmin) {
      throw new UnauthorizedException('Acesso não autorizado.');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      role: 'admin',
    };
  }
}
