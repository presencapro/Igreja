import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

const COOKIE_NAME = 'admin_token';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Não autenticado.');
    }

    await this.authService.me(token);
    return true;
  }
}
