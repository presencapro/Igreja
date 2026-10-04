import {
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { KeepAliveService } from './keep-alive.service';

@Controller('api/keep-alive')
export class KeepAliveController {
  constructor(
    private readonly config: ConfigService,
    private readonly keepAliveService: KeepAliveService,
  ) {}

  @Get()
  async keepAlive(@Headers('authorization') authorization?: string) {
    const secret = this.config.get<string>('KEEP_ALIVE_SECRET');
    if (!secret) {
      throw new InternalServerErrorException(
        'Keep-alive authentication is not configured.',
      );
    }

    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(authorization ?? '');
    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      throw new UnauthorizedException();
    }

    await this.keepAliveService.pingSupabase();
    return { status: 'ok' };
  }
}
