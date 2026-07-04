import { Module } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  imports: [AuthModule],
  controllers: [SiteController],
  providers: [SiteService, AdminAuthGuard],
})
export class SiteModule {}
