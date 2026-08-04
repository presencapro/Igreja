import { Module } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { PastoraisController } from './pastorais.controller';
import { PastoraisService } from './pastorais.service';
import { PastoralAuthGuard } from './pastoral-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [PastoraisController],
  providers: [PastoraisService, PastoralAuthGuard, AdminAuthGuard],
})
export class PastoraisModule {}
