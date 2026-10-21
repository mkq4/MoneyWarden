import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { GoogleProvider } from './oauth/google.provider.js';
import { OAUTH_PROVIDERS } from './oauth/oauth-provider.js';
import { OAuthController } from './oauth/oauth.controller.js';
import { ChallengeStore } from './passkey/challenge-store.js';
import { PasskeyController } from './passkey/passkey.controller.js';
import { PasskeyService } from './passkey/passkey.service.js';
import { VkProvider } from './oauth/vk.provider.js';
import { ACCESS_TOKEN_TTL_SEC, TokensService } from './tokens.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL_SEC },
      }),
    }),
  ],
  // OAuthController последним: его /auth/:provider иначе перехватит
  // статические маршруты (/me, /login, /passkey).
  controllers: [AuthController, PasskeyController, OAuthController],
  providers: [
    AuthService,
    TokensService,
    JwtAuthGuard,
    PasskeyService,
    ChallengeStore,
    GoogleProvider,
    VkProvider,
    {
      provide: OAUTH_PROVIDERS,
      inject: [GoogleProvider, VkProvider],
      useFactory: (...providers) => providers,
    },
  ],
  exports: [TokensService, JwtAuthGuard],
})
export class AuthModule {}
