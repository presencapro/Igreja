import { BadRequestException, Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { defaultSiteData } from './default-site.data';
import { GeneratePixDto } from './dto/generate-pix.dto';
import { generatePixPayload } from './pix';
import { SiteService } from './site.service';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  getSiteData() {
    return this.siteService.getSiteData();
  }

  @Post('pix')
  async generatePix(@Body() body: GeneratePixDto) {
    const siteData = await this.siteService.getSiteData();
    const pixConfig = siteData.pix ?? defaultSiteData.pix;

    if (!pixConfig?.key) {
      throw new BadRequestException('Chave PIX não configurada.');
    }

    const payload = generatePixPayload({
      chave: pixConfig.key,
      nome: siteData.name,
      cidade: pixConfig.city,
      valor: body.valor,
    });

    return { payload };
  }

  @Put()
  @UseGuards(AdminAuthGuard)
  updateSiteData(@Body() body: typeof defaultSiteData) {
    return this.siteService.updateSiteData(body);
  }
}
