import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
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

  @Post('instagram-video')
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(
    FileInterceptor('video', { limits: { fileSize: 50 * 1024 * 1024 } }),
  )
  uploadInstagramVideo(@UploadedFile() file: Express.Multer.File) {
    return this.siteService.updateInstagramVideo(file);
  }

  @Get('instagram-video/download')
  async downloadInstagramVideo(@Res() response: Response) {
    const video = await this.siteService.getInstagramVideoDownload();
    const extension =
      video.contentType === 'video/webm'
        ? 'webm'
        : video.contentType === 'video/quicktime'
          ? 'mov'
          : 'mp4';

    response.setHeader('Content-Type', video.contentType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="destaque-instagram.${extension}"`,
    );
    response.setHeader('Cache-Control', 'no-store');
    response.send(video.buffer);
  }
}
