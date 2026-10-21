import type { CookieOptions, Response } from 'express';
import {
  ACCESS_TOKEN_TTL_SEC,
  REFRESH_TOKEN_TTL_SEC,
  type TokenPair,
} from './tokens.service.js';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
/**
 * Подсказка без секретов «есть смысл пробовать refresh»: refresh-кука не видна
 * страницам фронта (path=/api/auth). Пропуском не является — proxy фронта
 * пускает только с валидным access-токеном, а с одной session шлёт на
 * GET /api/auth/refresh, где подделка отсеивается.
 */
export const SESSION_COOKIE = 'session';

// Не по NODE_ENV: в Docker это production, но фронт на http://localhost,
// и Secure-куки браузер (Safari, любой — по IP) просто не сохранит.
export const COOKIE_SECURE =
  process.env.FRONTEND_URL?.startsWith('https://') ?? false;

const base: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: COOKIE_SECURE,
};

const accessOptions: CookieOptions = { ...base, path: '/' };
// Refresh-токен уходит только на эндпоинты авторизации.
const refreshOptions: CookieOptions = { ...base, path: '/api/auth' };
const sessionOptions: CookieOptions = { ...base, httpOnly: false, path: '/' };

export function setAuthCookies(res: Response, tokens: TokenPair): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...accessOptions,
    maxAge: ACCESS_TOKEN_TTL_SEC * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...refreshOptions,
    maxAge: REFRESH_TOKEN_TTL_SEC * 1000,
  });
  res.cookie(SESSION_COOKIE, '1', {
    ...sessionOptions,
    maxAge: REFRESH_TOKEN_TTL_SEC * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, accessOptions);
  res.clearCookie(REFRESH_COOKIE, refreshOptions);
  res.clearCookie(SESSION_COOKIE, sessionOptions);
}
