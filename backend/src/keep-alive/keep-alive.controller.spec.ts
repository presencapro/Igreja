import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { KeepAliveController } from './keep-alive.controller';
import { KeepAliveService } from './keep-alive.service';

describe('KeepAliveController', () => {
  let controller: KeepAliveController;
  let config: { get: jest.Mock };
  let keepAliveService: { pingSupabase: jest.Mock };

  beforeEach(async () => {
    config = { get: jest.fn().mockReturnValue('test-secret') };
    keepAliveService = {
      pingSupabase: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeepAliveController],
      providers: [
        { provide: ConfigService, useValue: config },
        { provide: KeepAliveService, useValue: keepAliveService },
      ],
    }).compile();

    controller = module.get<KeepAliveController>(KeepAliveController);
  });

  it('rejects requests when the secret is not configured', async () => {
    config.get.mockReturnValue(undefined);

    await expect(controller.keepAlive('Bearer test-secret')).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(keepAliveService.pingSupabase).not.toHaveBeenCalled();
  });

  it('rejects requests with an invalid bearer token', async () => {
    await expect(controller.keepAlive('Bearer wrong-secret')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(keepAliveService.pingSupabase).not.toHaveBeenCalled();
  });

  it('queries Supabase for an authorized request', async () => {
    await expect(
      controller.keepAlive('Bearer test-secret'),
    ).resolves.toEqual({ status: 'ok' });
    expect(keepAliveService.pingSupabase).toHaveBeenCalledTimes(1);
  });
});
