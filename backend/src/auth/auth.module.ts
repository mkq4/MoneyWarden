import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ChallengeStore } from './passkey/challenge-store.js';
import { PasskeyController } from './passkey/passkey.controller.js';
import { PasskeyService } from './passkey/passkey.service.js';
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
  controllers: [AuthController, PasskeyController],
  providers: [
    AuthService,
    TokensService,
    JwtAuthGuard,
    PasskeyService,
    ChallengeStore,
  ],
  exports: [TokensService, JwtAuthGuard],
})
export class AuthModule {}
