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

  async login({ username, password }: LoginDto) {
    const email = `${username.trim().toLowerCase()}@${this.emailDomain}`;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Erro detalhado do Supabase:', error?.message);
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const role = data.user?.user_metadata?.role;
    if (role !== 'admin') {
      throw new UnauthorizedException('Acesso não autorizado.');
    }

    return {
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        role,
      },
    };
  }

  async me(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }

    const role = data.user.user_metadata?.role;
    if (role !== 'admin') {
      throw new UnauthorizedException('Acesso não autorizado.');
    }

    return {
      id: data.user.id,
      role,
    };
  }
}
