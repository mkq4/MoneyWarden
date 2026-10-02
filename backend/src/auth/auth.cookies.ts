import type { CookieOptions, Response } from 'express';
import {
  ACCESS_TOKEN_TTL_SEC,
  REFRESH_TOKEN_TTL_SEC,
  type TokenPair,
} from './tokens.service.js';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
/**
 * Маркер «есть сессия» без секретов: refresh-кука не видна страницам фронта
 * (path=/api/auth), а фронту нужно решать, пускать ли на защищённые страницы.
 */
export const SESSION_COOKIE = 'session';

const base: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
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
