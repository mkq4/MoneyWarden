import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { COOKIE_SECURE, setAuthCookies } from '../auth.cookies.js';
import { CurrentUser } from '../current-user.decorator.js';
import { JwtAuthGuard, type AuthUser } from '../jwt-auth.guard.js';
import { CHALLENGE_TTL_MS } from './challenge-store.js';
import { PasskeyLoginDto, PasskeyRegisterDto } from './passkey.dto.js';
import { PasskeyService } from './passkey.service.js';

const CHALLENGE_COOKIE = 'passkey_challenge';
const CHALLENGE_PATH = '/api/auth/passkey';

/**
 * Вход по Face ID / Touch ID (passkeys). Каждая операция — два шага:
 * options (челлендж) → ответ устройства на проверку.
 */
@ApiTags('Авторизация')
@Controller('auth/passkey')
export class PasskeyController {
  constructor(private readonly passkeys: PasskeyService) {}

  @Post('register/options')
  @ApiOperation({ summary: 'Passkey: параметры для создания ключа' })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async registrationOptions(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { options, challengeId } = await this.passkeys.registrationOptions(
      user.id,
    );
    setChallengeCookie(res, challengeId);
    return options;
  }

  @Post('register')
  @ApiOperation({ summary: 'Passkey: сохранить созданный на устройстве ключ' })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  async register(
    @CurrentUser() user: AuthUser,
    @Body() dto: PasskeyRegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.passkeys.register(
      user.id,
      takeChallengeCookie(req, res),
      dto.response,
      dto.name,
    );
  }

  @Post('login/options')
  @ApiOperation({ summary: 'Passkey: параметры для входа' })
  @HttpCode(200)
  async loginOptions(@Res({ passthrough: true }) res: Response) {
    const { options, challengeId } = await this.passkeys.loginOptions();
    setChallengeCookie(res, challengeId);
    return options;
  }

  @Post('login')
  @ApiOperation({ summary: 'Passkey: вход, ставит куки сессии' })
  @HttpCode(200)
  async login(
    @Body() dto: PasskeyLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const challengeId = takeChallengeCookie(req, res);
    setAuthCookies(res, await this.passkeys.login(challengeId, dto.response));
    return { ok: true };
  }

  @Get()
  @ApiOperation({ summary: 'Passkey: мои ключи' })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: AuthUser) {
    return this.passkeys.list(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Passkey: удалить ключ' })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.passkeys.remove(user.id, id);
  }
}

function setChallengeCookie(res: Response, id: string) {
  res.cookie(CHALLENGE_COOKIE, id, {
    httpOnly: true,
    sameSite: 'strict',
    secure: COOKIE_SECURE,
    path: CHALLENGE_PATH,
    maxAge: CHALLENGE_TTL_MS,
  });
}

/** Кука одноразовая, как и сам челлендж. */
function takeChallengeCookie(req: Request, res: Response): string | undefined {
  res.clearCookie(CHALLENGE_COOKIE, { path: CHALLENGE_PATH });
  const value: unknown = req.cookies?.[CHALLENGE_COOKIE];
  return typeof value === 'string' ? value : undefined;
}
