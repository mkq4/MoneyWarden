import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createDefaultCategories } from '../categories/default-categories.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
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

    const user = await this.createUser({
      username: dto.username,
      name: dto.name ?? null,
      passwordHash: await hashPassword(dto.password),
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

  /** Новый пользователь сразу получает стартовый набор категорий. */
  private createUser(data: Prisma.UserCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data });
      await createDefaultCategories(tx, user.id);
      return user;
    });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException();
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
