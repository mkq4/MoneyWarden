import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { OAuthProfile } from './oauth/oauth-provider.js';
import { hashPassword, verifyPassword } from './password.js';
import { TokensService, type TokenPair } from './tokens.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Логин уже занят');

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        name: dto.name ?? null,
        passwordHash: await hashPassword(dto.password),
      },
    });
    return this.tokens.issue(user.id);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    const ok =
      user?.passwordHash &&
      (await verifyPassword(dto.password, user.passwordHash));
    if (!user || !ok)
      throw new UnauthorizedException('Неверный логин или пароль');
    return this.tokens.issue(user.id);
  }

  /**
   * Вход через OAuth:
   * 1. аккаунт провайдера уже привязан — входим в этого пользователя;
   * 2. есть пользователь с тем же подтверждённым email — привязываем;
   * 3. иначе создаём нового пользователя (email может отсутствовать,
   *    например VK не всегда его отдаёт).
   */
  async loginWithOAuth(profile: OAuthProfile): Promise<TokenPair> {
    const { provider, providerAccountId } = profile;
    const accounts = { create: { provider, providerAccountId } };

    const account = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });
    if (account) return this.tokens.issue(account.userId);

    const email = profile.emailVerified ? profile.email : null;
    const user = email
      ? await this.prisma.user.upsert({
          where: { email },
          update: { accounts },
          create: { email, name: profile.name, accounts },
        })
      : await this.prisma.user.create({
          data: { name: profile.name, accounts },
        });
    return this.tokens.issue(user.id);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: { select: { provider: true } } },
    });
    if (!user) throw new NotFoundException();
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      hasPassword: user.passwordHash !== null,
      providers: user.accounts.map((a) => a.provider),
    };
  }
}
