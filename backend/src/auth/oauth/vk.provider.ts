import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthProfile, OAuthProvider } from './oauth-provider.js';

const VK_ID = 'https://id.vk.ru';

interface VkTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface VkUserInfoResponse {
  user?: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  error?: string;
  error_description?: string;
}

/**
 * VK ID (OAuth 2.1). PKCE обязателен, client secret не используется —
 * его роль играет code_verifier. В колбэк VK дополнительно присылает
 * device_id, который нужен при обмене кода на токен.
 */
@Injectable()
export class VkProvider implements OAuthProvider {
  readonly slug = 'vk';

  constructor(private readonly config: ConfigService) {}

  private get clientId() {
    return this.config.get<string>('VK_CLIENT_ID');
  }

  isConfigured(): boolean {
    return Boolean(this.clientId);
  }

  getAuthorizationUrl({
    state,
    codeChallenge,
    redirectUri,
  }: {
    state: string;
    codeChallenge: string;
    redirectUri: string;
  }): string {
    const url = new URL(`${VK_ID}/authorize`);
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId!,
      redirect_uri: redirectUri,
      scope: 'email',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    }).toString();
    return url.toString();
  }

  async getProfile({
    code,
    codeVerifier,
    redirectUri,
    query,
  }: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
    query: Record<string, string>;
  }): Promise<OAuthProfile> {
    if (!query.device_id) throw new Error('VK callback without device_id');

    const token = await this.post<VkTokenResponse>('/oauth2/auth', {
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: this.clientId!,
      device_id: query.device_id,
      redirect_uri: redirectUri,
    });
    if (!token.access_token) {
      throw new Error(
        `VK token exchange failed: ${token.error_description ?? token.error}`,
      );
    }

    const { user, ...info } = await this.post<VkUserInfoResponse>(
      '/oauth2/user_info',
      { client_id: this.clientId!, access_token: token.access_token },
    );
    if (!user?.user_id) {
      throw new Error(
        `VK user_info failed: ${info.error_description ?? info.error}`,
      );
    }

    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return {
      provider: 'VK',
      providerAccountId: String(user.user_id),
      email: user.email?.toLowerCase() || null,
      // user_info отдаёт только подтверждённый в VK email
      emailVerified: Boolean(user.email),
      name: name || null,
    };
  }

  /** VK ID отвечает ошибками и с HTTP 200, и с 4xx — разбираем тело в любом случае. */
  private async post<T>(
    path: string,
    body: Record<string, string>,
  ): Promise<T> {
    const res = await fetch(`${VK_ID}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });
    try {
      return (await res.json()) as T;
    } catch {
      throw new Error(`VK ${path} failed: ${res.status}`);
    }
  }
}
