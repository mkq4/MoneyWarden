import type { AuthProvider } from '../../generated/prisma/client.js';

export interface OAuthProfile {
  provider: AuthProvider;
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

export interface OAuthProvider {
  /** Сегмент URL: /api/auth/<slug>, /api/auth/<slug>/callback */
  readonly slug: string;
  isConfigured(): boolean;
  getAuthorizationUrl(params: {
    state: string;
    codeChallenge: string;
    redirectUri: string;
  }): string;
  /** query — все параметры колбэка (VK ID, например, присылает device_id). */
  getProfile(params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
    query: Record<string, string>;
  }): Promise<OAuthProfile>;
}

export const OAUTH_PROVIDERS = Symbol('OAUTH_PROVIDERS');
