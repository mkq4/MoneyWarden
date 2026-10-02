import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthProfile, OAuthProvider } from './oauth-provider.js';

interface GoogleTokenResponse {
  access_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

@Injectable()
export class GoogleProvider implements OAuthProvider {
  readonly slug = 'google';

  constructor(private readonly config: ConfigService) {}

  private get clientId() {
    return this.config.get<string>('GOOGLE_CLIENT_ID');
  }

  private get clientSecret() {
    return this.config.get<string>('GOOGLE_CLIENT_SECRET');
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
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
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: this.clientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    }).toString();
    return url.toString();
  }

  async getProfile({
    code,
    codeVerifier,
    redirectUri,
  }: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): Promise<OAuthProfile> {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId!,
        client_secret: this.clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }),
    });
    if (!tokenRes.ok) {
      throw new Error(`Google token exchange failed: ${tokenRes.status}`);
    }
    const { access_token } = (await tokenRes.json()) as GoogleTokenResponse;

    const infoRes = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    if (!infoRes.ok) {
      throw new Error(`Google userinfo failed: ${infoRes.status}`);
    }
    const info = (await infoRes.json()) as GoogleUserInfo;

    return {
      provider: 'GOOGLE',
      providerAccountId: info.sub,
      email: info.email?.toLowerCase() ?? null,
      emailVerified: info.email_verified === true,
      name: info.name ?? null,
    };
  }
}
