import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { CreateInscricaoDto } from './dto/create-inscricao.dto';
import { CreatePastoralDto } from './dto/create-pastoral.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PastoralLoginDto } from './dto/pastoral-login.dto';
import { UpdatePastoralDto } from './dto/update-pastoral.dto';
import { PastoralAuthGuard } from './pastoral-auth.guard';
import { PastoraisService } from './pastorais.service';

const COOKIE_NAME = 'pastoral_token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const,
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};

interface PastoralRequest extends Request {
  pastoralId?: string;
  pastoral?: import('./default-pastorais.data').Pastoral;
}

@Controller('pastorais')
export class PastoraisController {
  constructor(private readonly pastoraisService: PastoraisService) {}

  @Get()
  async list() {
    return this.pastoraisService.listPastorais();
  }

  @Get('me')
  @UseGuards(PastoralAuthGuard)
  async me(@Req() req: PastoralRequest) {
    if (!req.pastoralId) {
      throw new ForbiddenException('Acesso negado.');
    }
    const pastoral = await this.pastoraisService.getPastoralPublic(
      req.pastoralId,
    );
    if (!pastoral) {
      throw new NotFoundException('Pastoral não encontrada.');
    }
    const inscricoes = await this.pastoraisService.listInscricoes(
      req.pastoralId,
    );
    return { ...pastoral, inscricoes };
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const pastoral = await this.pastoraisService.getPastoralPublic(id);
    if (!pastoral) {
      throw new NotFoundException('Pastoral não encontrada.');
    }
    return pastoral;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: PastoralLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body.email?.trim() || !body.password) {
      throw new BadRequestException('Email e senha são obrigatórios.');
    }
    const result = await this.pastoraisService.login(body.email, body.password);
    if (!result) {
      throw new BadRequestException('Email ou senha inválidos.');
    }

    res.cookie(COOKIE_NAME, result.token, cookieOptions);
    return {
      authenticated: true,
      token: result.token,
      pastoral: result.pastoral,
    };
  }

  /** POST /pastorais/logout — apaga o cookie da pastoral */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { authenticated: false };
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async create(@Body() body: CreatePastoralDto) {
    if (!body.name?.trim()) {
      throw new BadRequestException('O nome da pastoral é obrigatório.');
    }
    return this.pastoraisService.createPastoral(body);
  }

  @Put(':id')
  @UseGuards(PastoralAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePastoralDto,
    @Req() req: PastoralRequest,
  ) {
    await this.assertOwnerOrAdmin(req, id);
    const pastoral = await this.pastoraisService.updatePastoral(id, body);
    if (!pastoral) {
      throw new NotFoundException('Pastoral não encontrada.');
    }
    return pastoral;
  }

  @Delete(':id')
  @UseGuards(PastoralAuthGuard)
  async remove(@Param('id') id: string, @Req() req: PastoralRequest) {
    await this.assertOwnerOrAdmin(req, id);
    const removed = await this.pastoraisService.deletePastoral(id);
    if (!removed) {
      throw new NotFoundException('Pastoral não encontrada.');
    }
    return { removed: true };
  }

  // ==================== Inscrições ====================

  @Post(':id/inscricoes')
  async createInscricao(
    @Param('id') id: string,
    @Body() body: CreateInscricaoDto,
  ) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Informe seu nome para se inscrever.');
    }
    const inscricao = await this.pastoraisService.addInscricao(id, body);
    if (!inscricao) {
      throw new NotFoundException('Pastoral não encontrada.');
    }
    return inscricao;
  }

  @Get(':id/inscricoes')
  @UseGuards(PastoralAuthGuard)
  async inscricoes(@Param('id') id: string, @Req() req: PastoralRequest) {
    await this.assertOwnerOrAdmin(req, id);
    return this.pastoraisService.listInscricoes(id);
  }

  @Delete(':id/inscricoes/:inscricaoId')
  @UseGuards(PastoralAuthGuard)
  async removeInscricao(
    @Param('id') id: string,
    @Param('inscricaoId') inscricaoId: string,
    @Req() req: PastoralRequest,
  ) {
    await this.assertOwnerOrAdmin(req, id);
    const removed = await this.pastoraisService.deleteInscricao(
      id,
      inscricaoId,
    );
    if (!removed) {
      throw new NotFoundException('Inscrição não encontrada.');
    }
    return { removed: true };
  }

  // ==================== Posts ====================

  @Post(':id/posts')
  @UseGuards(PastoralAuthGuard)
  async createPost(
    @Param('id') id: string,
    @Body() body: CreatePostDto,
    @Req() req: PastoralRequest,
  ) {
    await this.assertOwnerOrAdmin(req, id);
    if (!body.title?.trim()) {
      throw new BadRequestException('O título do post é obrigatório.');
    }
    const post = await this.pastoraisService.addPost(id, body);
    if (!post) {
      throw new NotFoundException('Pastoral não encontrada.');
    }
    return post;
  }

  @Put(':id/posts/:postId')
  @UseGuards(PastoralAuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() body: CreatePostDto,
    @Req() req: PastoralRequest,
  ) {
    await this.assertOwnerOrAdmin(req, id);
    const post = await this.pastoraisService.updatePost(id, postId, body);
    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }
    return post;
  }

  @Delete(':id/posts/:postId')
  @UseGuards(PastoralAuthGuard)
  async removePost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Req() req: PastoralRequest,
  ) {
    await this.assertOwnerOrAdmin(req, id);
    const removed = await this.pastoraisService.deletePost(id, postId);
    if (!removed) {
      throw new NotFoundException('Post não encontrado.');
    }
    return { removed: true };
  }

  // ==================== Helpers ====================

  private async assertOwnerOrAdmin(req: PastoralRequest, id: string) {
    // Se o guard autenticou uma pastoral, ela só pode gerenciar a si mesma.
    if (req.pastoralId) {
      const pastoral = await this.pastoraisService.resolvePastoral(id);
      if (!pastoral || pastoral.id !== req.pastoralId) {
        throw new ForbiddenException(
          'Você não tem permissão para esta pastoral.',
        );
      }
      return;
    }
    // Admin tem acesso total (o guard já validou o token de admin).
  }
}
