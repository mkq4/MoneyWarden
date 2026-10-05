import { Injectable } from '@nestjs/common';
import { formatDate, today } from '../common/period.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { computeAdjustment } from './balance.js';

type Db = PrismaService | Prisma.TransactionClient;

@Injectable()
export class SavingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Накоплено всего: не хранится, а считается — удаление операций пересчитывает его само. */
  async getTotal(userId: number, db: Db = this.prisma): Promise<number> {
    const { _sum } = await db.transaction.aggregate({
      where: { userId, type: { in: ['SAVING', 'SAVING_ADJUSTMENT'] } },
      _sum: { amount: true },
    });
    return _sum.amount ?? 0;
  }

  async setBalance(userId: number, targetAmount: number) {
    return this.prisma.$transaction(async (tx) => {
      // Одной транзакции при READ COMMITTED мало: два параллельных запроса
      // прочитали бы один и тот же total и записали delta дважды. Блокировка
      // строки пользователя выстраивает их в очередь.
      await tx.$queryRaw`SELECT 1 FROM "User" WHERE "id" = ${userId} FOR UPDATE`;

      const total = await this.getTotal(userId, tx);
      const delta = computeAdjustment(total, targetAmount);
      if (delta === null) return { total, adjustment: null };

      const adjustment = await tx.transaction.create({
        data: {
          userId,
          type: 'SAVING_ADJUSTMENT',
          amount: delta,
          categoryId: null,
          // В запросе даты нет; на статистику месяца корректировка не влияет.
          date: today(),
        },
      });
      return {
        total: total + delta,
        adjustment: {
          id: adjustment.id,
          type: adjustment.type,
          amount: adjustment.amount,
          date: formatDate(adjustment.date),
        },
      };
    });
  }
}
