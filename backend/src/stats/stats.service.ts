import { Injectable } from '@nestjs/common';
import {
  currentMonth,
  formatDate,
  lastMonths,
  monthPeriod,
  periodDays,
  previousPeriod,
  today,
  type Period,
} from '../common/period.js';
import { Prisma, type TransactionType } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CategoryStatsQueryDto,
  DailyStatsQueryDto,
  MonthlyStatsQueryDto,
} from './dto/stats-query.dto.js';
import { fillDays, fillMonths, percentChange } from './fill.js';
import { monthTotals } from './month-totals.js';

const formatPeriod = ({ from, to }: Period) => ({
  from: formatDate(from),
  to: formatDate(to),
});

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Доходы, расходы, отложено и свободный остаток за период
   * + сравнение с предыдущим периодом.
   */
  async summary(userId: number, period: Period) {
    const prev = previousPeriod(period);
    const [current, previous] = await Promise.all([
      this.totals(userId, period),
      this.totals(userId, prev),
    ]);
    return {
      period: formatPeriod(period),
      ...current,
      previous: { period: formatPeriod(prev), ...previous },
      change: {
        incomePct: percentChange(current.income, previous.income),
        expensePct: percentChange(current.expense, previous.expense),
      },
    };
  }

  /** Разбивка по категориям, по убыванию суммы. */
  async byCategory(userId: number, period: Period, q: CategoryStatsQueryDto) {
    const groups = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: q.type,
        date: { gte: period.from, lte: period.to },
      },
      _sum: { amount: true },
      _count: true,
    });
    const categories = await this.prisma.category.findMany({
      // У доходов/расходов категория всегда есть (CHECK в БД), null отсекаем для типов.
      where: {
        id: { in: groups.flatMap((g) => (g.categoryId ? [g.categoryId] : [])) },
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        archivedAt: true,
      },
    });
    const total = groups.reduce((acc, g) => acc + (g._sum.amount ?? 0), 0);

    const items = groups
      .map((g) => {
        const sum = g._sum.amount ?? 0;
        return {
          category: categories.find((c) => c.id === g.categoryId)!,
          total: sum,
          count: g._count,
          share: total ? Math.round((sum / total) * 10000) / 10000 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return { period: formatPeriod(period), type: q.type, total, items };
  }

  /** Помесячная динамика за последние N месяцев. */
  async monthly(userId: number, q: MonthlyStatsQueryDto) {
    const months = lastMonths(q.months, q.until ?? currentMonth());
    const from = monthPeriod(months[0]).from;
    const to = monthPeriod(months[months.length - 1]).to;

    const rows = await this.prisma.$queryRaw<
      { month: string; type: TransactionType; total: bigint }[]
    >`
      SELECT to_char("date", 'YYYY-MM') AS month, "type", SUM("amount")::bigint AS total
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND "date" BETWEEN ${from} AND ${to}
        ${q.categoryId !== undefined ? Prisma.sql`AND "categoryId" = ${q.categoryId}` : Prisma.empty}
      GROUP BY 1, 2
    `;

    return fillMonths(
      months,
      rows.map((r) => ({ ...r, total: Number(r.total) })),
    );
  }

  /** Суммы по дням месяца. Для текущего месяца среднее — по прошедшим дням. */
  async daily(userId: number, q: DailyStatsQueryDto) {
    const month = q.month ?? currentMonth();
    const period = monthPeriod(month);
    const groups = await this.prisma.transaction.groupBy({
      by: ['date'],
      where: {
        userId,
        type: q.type,
        date: { gte: period.from, lte: period.to },
      },
      _sum: { amount: true },
    });

    const days = fillDays(
      period,
      groups.map((g) => ({
        date: formatDate(g.date),
        total: g._sum.amount ?? 0,
      })),
    );
    const total = days.reduce((acc, d) => acc + d.total, 0);

    const now = today();
    const elapsed =
      now > period.to
        ? periodDays(period)
        : now < period.from
          ? 0
          : periodDays({ from: period.from, to: now });

    const maxDay = days.reduce<(typeof days)[number] | null>(
      (max, d) => (d.total > 0 && (!max || d.total > max.total) ? d : max),
      null,
    );

    return {
      month,
      type: q.type,
      total,
      avgPerDay: elapsed ? Math.round(total / elapsed) : 0,
      maxDay,
      days,
    };
  }

  private async totals(userId: number, period: Period) {
    const groups = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, date: { gte: period.from, lte: period.to } },
      _sum: { amount: true },
      _count: true,
    });
    return monthTotals(
      groups.map((g) => ({
        type: g.type,
        sum: g._sum.amount ?? 0,
        count: g._count,
      })),
    );
  }
}
