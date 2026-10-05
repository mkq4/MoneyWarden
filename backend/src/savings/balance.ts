import { BadRequestException } from '@nestjs/common';

/** Верхняя граница колонки amount (INT4). */
export const INT4_MAX = 2_147_483_647;

/**
 * Сколько нужно скорректировать, чтобы накопления стали равны target.
 * null — менять нечего (корректировку не создаём).
 */
export function computeAdjustment(
  total: number,
  target: number,
): number | null {
  const delta = target - total;
  if (delta === 0) return null;
  // Возможна, если накоплено больше ~21 млн ₽ и баланс сбрасывают в 0.
  if (Math.abs(delta) > INT4_MAX) {
    throw new BadRequestException(
      'Слишком большая разница с текущим балансом для одной корректировки',
    );
  }
  return delta;
}
