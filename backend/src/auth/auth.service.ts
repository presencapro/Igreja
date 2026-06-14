import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const serviceKey = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');

    this.supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  private getAuthEmail(payload: Partial<LoginDto>) {
    const email = payload.email?.trim().toLowerCase();
    if (!email) {
      return null;
    }

    return email;
  }

  async login({ email, password }: LoginDto) {
    const authEmail = this.getAuthEmail({ email });

    if (!authEmail || !password?.trim()) {
      throw new UnauthorizedException('Email e senha são obrigatórios.');
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error || !data.session || !data.user?.email) {
      console.error('Supabase login error:', error);
      throw new UnauthorizedException(error?.message ?? 'Email ou senha inválidos.');
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

    return {
      id: data.user.id,
      email: data.user.email,
      role: 'admin',
    };
  }
}
