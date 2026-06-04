import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

const COOKIE_NAME = 'admin_token';

const cookieOptions = {
  httpOnly: true,                                        // JS não consegue ler
  secure: process.env.NODE_ENV === 'production',         // HTTPS apenas em produção
  sameSite: 'lax' as const,                             // Proteção CSRF básica
  maxAge: 8 * 60 * 60 * 1000,                          // 8 horas em ms
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /auth/login — autentica e define o cookie HttpOnly */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.login(body);

    res.cookie(COOKIE_NAME, accessToken, cookieOptions);

    // Retorna apenas dados não-sensíveis ao frontend (sem token no body)
    return { authenticated: true, role: user.role };
  }

  /** GET /auth/me — verifica se o cookie é válido e retorna o usuário */
  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Não autenticado.');
    }

    const user = await this.authService.me(token);
    return { authenticated: true, role: user.role };
  }

  /** POST /auth/logout — apaga o cookie */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { authenticated: false };
  }
}
