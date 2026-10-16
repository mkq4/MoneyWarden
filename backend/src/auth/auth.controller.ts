import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from './auth.cookies.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard, type AuthUser } from './jwt-auth.guard.js';
import { TokensService } from './tokens.service.js';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokensService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация по логину и паролю, ставит куки сессии',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    setAuthCookies(res, await this.auth.register(dto));
    return { ok: true };
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход по логину и паролю, ставит куки сессии' })
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    setAuthCookies(res, await this.auth.login(dto));
    return { ok: true };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Новая пара токенов по refresh-куке' })
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.rotate(req, res);
    return { ok: true };
  }

  /**
   * То же обновление, но для навигации: proxy фронта шлёт сюда страницу
   * с протухшим access-токеном (refresh-кука видна только на /api/auth).
   * Успех — обратно на next, иначе куки стираются и — на /login.
   */
  @Get('refresh')
  @ApiExcludeEndpoint()
  async refreshAndRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Query('next') next?: string,
  ) {
    const frontend = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    try {
      await this.rotate(req, res);
      res.redirect(frontend + safeNextPath(next));
    } catch {
      res.redirect(`${frontend}/login`);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход: отзыв refresh-токена и очистка кук' })
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) await this.tokens.revoke(token);
    clearAuthCookies(res);
    return { ok: true };
  }

  private async rotate(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    try {
      if (!token) throw new UnauthorizedException();
      setAuthCookies(res, await this.tokens.rotate(token));
    } catch (e) {
      clearAuthCookies(res);
      throw e;
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.getProfile(user.id);
  }
}

/** Только путь внутри фронта; «//host» и «/\host» отбрасываем — защита от open redirect. */
function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith('/') || /^\/[/\\]/.test(next)) return '/';
  return next;
}
