import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { defaultSiteData } from './default-site.data';
import { SiteService } from './site.service';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  getSiteData() {
    return this.siteService.getSiteData();
  }

  @Put()
  @UseGuards(AdminAuthGuard)
  updateSiteData(@Body() body: typeof defaultSiteData) {
    return this.siteService.updateSiteData(body);
  }
}
