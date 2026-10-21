import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TokensService, type TokenPair } from '../tokens.service.js';
import { ChallengeStore } from './challenge-store.js';
import {
  isAuthenticationResponse,
  isRegistrationResponse,
} from './passkey.guards.js';

const RP_NAME = 'MoneyWarden';
const DEFAULT_NAME = 'Ключ доступа';

/**
 * Passkeys (WebAuthn). Сервер — «relying party»: выдаёт челлендж, устройство
 * подписывает его ключом после Face ID / Touch ID, сервер проверяет подпись
 * сохранённым публичным ключом. Биометрия не покидает устройство.
 *
 * rpID/origin берутся из FRONTEND_URL: ключ привязан к домену фронта.
 */
@Injectable()
export class PasskeyService {
  private readonly origin: string;
  private readonly rpID: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
    private readonly challenges: ChallengeStore,
    config: ConfigService,
  ) {
    this.origin = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    this.rpID = new URL(this.origin).hostname;
  }

  /** Шаг 1 регистрации: параметры для navigator.credentials.create(). */
  async registrationOptions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { passkeys: { select: { id: true, transports: true } } },
    });
    if (!user) throw new NotFoundException();
    const userName = user.username ?? user.email ?? `user${user.id}`;

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: this.rpID,
      userName,
      userDisplayName: user.name ?? userName,
      attestationType: 'none',
      // Не даём второй раз зарегистрировать тот же ключ
      excludeCredentials: user.passkeys,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    });
    return {
      options,
      challengeId: this.challenges.save(options.challenge, userId),
    };
  }

  /** Шаг 2 регистрации: проверить ответ устройства и сохранить публичный ключ. */
  async register(
    userId: number,
    challengeId: string | undefined,
    response: unknown,
    name: string | undefined,
  ) {
    const saved = this.challenges.take(challengeId);
    if (!saved || saved.userId !== userId) {
      throw new BadRequestException('Время на подтверждение истекло');
    }
    if (!isRegistrationResponse(response)) {
      throw new BadRequestException('Некорректный ответ устройства');
    }

    const result = await verifyRegistrationResponse({
      response,
      expectedChallenge: saved.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: true,
    }).catch(() => null);
    if (!result?.verified) {
      throw new BadRequestException('Не удалось подтвердить ключ');
    }

    const { credential } = result.registrationInfo;
    const passkey = await this.prisma.passkey.create({
      data: {
        id: credential.id,
        userId,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports ?? [],
        name: name ?? DEFAULT_NAME,
      },
    });
    return toView(passkey);
  }

  /**
   * Шаг 1 входа. allowCredentials пустой — устройство само предложит
   * подходящий ключ (discoverable credential), логин вводить не нужно.
   */
  async loginOptions() {
    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'required',
    });
    return {
      options,
      challengeId: this.challenges.save(options.challenge, null),
    };
  }

  /** Шаг 2 входа: проверить подпись и выдать обычную пару токенов. */
  async login(
    challengeId: string | undefined,
    response: unknown,
  ): Promise<TokenPair> {
    const saved = this.challenges.take(challengeId);
    if (!saved || !isAuthenticationResponse(response)) {
      throw new UnauthorizedException('Не удалось войти по ключу');
    }
    const passkey = await this.prisma.passkey.findUnique({
      where: { id: response.id },
    });
    if (!passkey) throw new UnauthorizedException('Ключ не найден');

    const result = await verifyAuthenticationResponse({
      response,
      expectedChallenge: saved.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: true,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: Number(passkey.counter),
        transports: passkey.transports,
      },
    }).catch(() => null);
    if (!result?.verified) {
      throw new UnauthorizedException('Не удалось войти по ключу');
    }

    await this.prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: result.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      },
    });
    return this.tokens.issue(passkey.userId);
  }

  async list(userId: number) {
    const passkeys = await this.prisma.passkey.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return passkeys.map(toView);
  }

  async remove(userId: number, id: string) {
    const { count } = await this.prisma.passkey.deleteMany({
      where: { id, userId },
    });
    if (!count) throw new NotFoundException();
    return { ok: true };
  }
}

/** Наружу — без публичного ключа и счётчика. */
function toView(p: {
  id: string;
  name: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}) {
  return {
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    lastUsedAt: p.lastUsedAt,
  };
}
