import {
  Controller,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { setAuthCookies } from '../auth.cookies.js';
import { AuthService } from '../auth.service.js';
import { OAUTH_PROVIDERS, type OAuthProvider } from './oauth-provider.js';

const STATE_COOKIE = 'oauth_state';
const STATE_TTL_MS = 10 * 60 * 1000;

interface StateCookie {
  provider: string;
  state: string;
  verifier: string;
}

/**
 * Authorization Code + PKCE для любого провайдера:
 *   GET /api/auth/:provider          → редирект на провайдера
 *   GET /api/auth/:provider/callback → ставим куки, редирект на фронт
 */
@ApiTags('Авторизация')
@Controller('auth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(
    @Inject(OAUTH_PROVIDERS) private readonly providers: OAuthProvider[],
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get(':provider')
  @ApiOperation({
    summary: 'Вход через OAuth (google | vk) — редирект к провайдеру',
  })
  start(@Param('provider') slug: string, @Res() res: Response) {
    const provider = this.getProvider(slug);
    // VK ID требует state длиной от 32 символов
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256')
      .update(verifier)
      .digest('base64url');

    res.cookie(
      STATE_COOKIE,
      JSON.stringify({ provider: slug, state, verifier } satisfies StateCookie),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/api/auth',
        maxAge: STATE_TTL_MS,
      },
    );
    res.redirect(
      provider.getAuthorizationUrl({
        state,
        codeChallenge,
        redirectUri: this.redirectUri(slug),
      }),
    );
  }

  @Get(':provider/callback')
  @ApiExcludeEndpoint()
  async callback(
    @Param('provider') slug: string,
    @Query() query: Record<string, string>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const provider = this.getProvider(slug);
    const saved = parseStateCookie(req.cookies?.[STATE_COOKIE]);
    res.clearCookie(STATE_COOKIE, { path: '/api/auth' });

    try {
      if (query.error) throw new Error(`Provider error: ${query.error}`);
      if (
        !saved ||
        saved.provider !== slug ||
        !query.code ||
        !safeEqual(query.state ?? '', saved.state)
      ) {
        throw new Error('Invalid OAuth state');
      }

      const profile = await provider.getProfile({
        code: query.code,
        codeVerifier: saved.verifier,
        redirectUri: this.redirectUri(slug),
        query,
      });
      setAuthCookies(res, await this.auth.loginWithOAuth(profile));
      res.redirect(this.frontendUrl());
    } catch (e) {
      this.logger.warn(`OAuth ${slug} failed: ${(e as Error).message}`);
      res.redirect(`${this.frontendUrl()}/login?error=oauth`);
    }
  }

  private getProvider(slug: string): OAuthProvider {
    const provider = this.providers.find((p) => p.slug === slug);
    if (!provider) throw new NotFoundException();
    if (!provider.isConfigured()) {
      throw new ServiceUnavailableException(`${slug} OAuth не настроен`);
    }
    return provider;
  }

  private redirectUri(slug: string): string {
    const base = this.config.get<string>(
      'BACKEND_PUBLIC_URL',
      'http://localhost:4000',
    );
    return `${base}/api/auth/${slug}/callback`;
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }
}

function parseStateCookie(raw: unknown): StateCookie | null {
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw) as StateCookie;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
