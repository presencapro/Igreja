import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { PastoraisService } from './pastorais.service';

const COOKIE_NAME = 'pastoral_token';

@Injectable()
export class PastoralAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly pastoraisService: PastoraisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies = request.cookies as Record<string, string> | undefined;
    const authorization = request.headers.authorization;
    const cookieToken = cookies?.[COOKIE_NAME];
    const headerToken =
      typeof authorization === 'string' && authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : undefined;
    const token = cookieToken || headerToken;

    if (!token) {
      throw new UnauthorizedException('Não autenticado.');
    }

    // Primeiro valida o token da pastoral (rápido, sem depender do Supabase).
    const pastoralId = this.pastoraisService.verifyToken(token);
    if (pastoralId) {
      const pastoral = await this.pastoraisService.findPastoralById(pastoralId);
      if (!pastoral) {
        throw new UnauthorizedException('Pastoral não encontrada.');
      }
      request.pastoral = pastoral;
      request.pastoralId = pastoral.id;
      return true;
    }

    // Admin também tem acesso total
    const adminValid = await this.isAdmin(token);
    if (adminValid) {
      return true;
    }

    throw new UnauthorizedException('Sessão inválida ou expirada.');
  }

  private async isAdmin(token: string): Promise<boolean> {
    try {
      const user = await this.authService.me(token);
      return user.role === 'admin';
    } catch {
      return false;
    }
  }
}
