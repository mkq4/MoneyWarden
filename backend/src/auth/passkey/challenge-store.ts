import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

interface Entry {
  challenge: string;
  /** Для регистрации — чей ключ; для входа — null (пользователь ещё неизвестен). */
  userId: number | null;
  expiresAt: number;
}

/**
 * Одноразовые WebAuthn-челленджи в памяти процесса: в куку уходит только
 * случайный id, сам челлендж забирается ровно один раз — повтор перехваченного
 * ответа не пройдёт. Бэкенд один, поэтому общий стор (Redis) не нужен.
 */
@Injectable()
export class ChallengeStore {
  private readonly entries = new Map<string, Entry>();

  save(challenge: string, userId: number | null): string {
    this.sweep();
    const id = randomBytes(16).toString('base64url');
    this.entries.set(id, {
      challenge,
      userId,
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
    });
    return id;
  }

  take(id: string | undefined): Entry | null {
    if (!id) return null;
    const entry = this.entries.get(id);
    this.entries.delete(id);
    return entry && entry.expiresAt > Date.now() ? entry : null;
  }

  private sweep() {
    const now = Date.now();
    for (const [id, e] of this.entries)
      if (e.expiresAt <= now) this.entries.delete(id);
  }
}
