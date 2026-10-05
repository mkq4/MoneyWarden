import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service.js';
import { formatDate, parseDate, resolvePeriod } from '../common/period.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from './dto/transaction.dto.js';

const include = {
  category: {
    select: { id: true, name: true, color: true, icon: true, archivedAt: true },
  },
} satisfies Prisma.TransactionInclude;

type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: typeof include;
}>;

/** date отдаём строкой YYYY-MM-DD, а не ISO с полночью UTC. */
const toResponse = (t: TransactionWithCategory) => ({
  id: t.id,
  type: t.type,
  amount: t.amount,
  date: formatDate(t.date),
  comment: t.comment,
  categoryId: t.categoryId,
  category: t.category,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
  ) {}

  async list(userId: number, q: ListTransactionsQueryDto) {
    const where = this.buildWhere(userId, q);
    const [items, total, sums] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true },
      }),
    ]);
    const sumOf = (type: string) =>
      sums.find((s) => s.type === type)?._sum.amount ?? 0;

    return {
      items: items.map(toResponse),
      total,
      page: q.page,
      limit: q.limit,
      sums: {
        income: sumOf('INCOME'),
        expense: sumOf('EXPENSE'),
        saved: sumOf('SAVING'),
      },
    };
  }

  async get(userId: number, id: number) {
    return toResponse(await this.findOwned(userId, id));
  }

  async create(userId: number, dto: CreateTransactionDto) {
    const base = {
      userId,
      amount: dto.amount,
      date: parseDate(dto.date),
      comment: dto.comment ?? null,
    };
    if (dto.type === 'SAVING') {
      const created = await this.prisma.transaction.create({
        data: { ...base, type: 'SAVING', categoryId: null },
        include,
      });
      return toResponse(created);
    }

    // DTO гарантирует, что для доходов/расходов categoryId передан.
    const category = await this.categories.findUsable(userId, dto.categoryId!);
    if (dto.type && dto.type !== category.type) {
      throw new BadRequestException(
        'Тип операции не совпадает с типом категории',
      );
    }
    const created = await this.prisma.transaction.create({
      data: { ...base, type: category.type, categoryId: category.id },
      include,
    });
    return toResponse(created);
  }

  async update(userId: number, id: number, dto: UpdateTransactionDto) {
    const existing = await this.findOwned(userId, id);
    if (existing.type === 'SAVING_ADJUSTMENT') {
      // Иначе PATCH стал бы обходом запрета создавать корректировки напрямую.
      throw new BadRequestException(
        'Корректировку накоплений нельзя изменить: удалите её или задайте баланс заново',
      );
    }
    if (existing.type === 'SAVING' && dto.categoryId !== undefined) {
      throw new BadRequestException('У накоплений нет категории');
    }
    const data: Prisma.TransactionUncheckedUpdateInput = {
      amount: dto.amount,
      date: dto.date ? parseDate(dto.date) : undefined,
      comment: dto.comment,
    };
    // Смена категории может поменять и тип операции (расход ↔ доход).
    if (
      dto.categoryId !== undefined &&
      dto.categoryId !== existing.categoryId
    ) {
      const category = await this.categories.findUsable(userId, dto.categoryId);
      data.categoryId = category.id;
      data.type = category.type;
    }
    const updated = await this.prisma.transaction.update({
      where: { id },
      data,
      include,
    });
    return toResponse(updated);
  }

  async remove(userId: number, id: number) {
    await this.findOwned(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
    return { deleted: true };
  }

  private async findOwned(userId: number, id: number) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include,
    });
    if (!tx) throw new NotFoundException('Операция не найдена');
    return tx;
  }

  private buildWhere(
    userId: number,
    q: ListTransactionsQueryDto,
  ): Prisma.TransactionWhereInput {
    const hasPeriod = Boolean(q.month || q.from || q.to);
    const period = hasPeriod ? resolvePeriod(q) : null;
    return {
      userId,
      type: q.type,
      categoryId: q.categoryIds?.length ? { in: q.categoryIds } : undefined,
      date: period ? { gte: period.from, lte: period.to } : undefined,
      amount:
        q.minAmount !== undefined || q.maxAmount !== undefined
          ? { gte: q.minAmount, lte: q.maxAmount }
          : undefined,
      comment: q.search?.trim()
        ? { contains: q.search.trim(), mode: 'insensitive' }
        : undefined,
    };
  }
}
