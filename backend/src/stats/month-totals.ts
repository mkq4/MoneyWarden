import type { TransactionType } from '../generated/prisma/client.js';

export interface TypeGroup {
  type: TransactionType;
  sum: number;
  count: number;
}

export interface MonthTotals {
  income: number;
  expense: number;
  /** income - expense (как и раньше: без учёта накоплений) */
  balance: number;
  /** Отложено в накопления за период (только SAVING) */
  saved: number;
  /** Свободный остаток: income - expense - saved */
  free: number;
  /** Число операций без корректировок накоплений */
  count: number;
}

/**
 * Итоги периода по суммам в разрезе типов. SAVING_ADJUSTMENT сюда намеренно
 * не попадает: это поправка баланса накоплений (стартовый остаток, проценты,
 * снятие), а не движение денег в этом месяце.
 */
export function monthTotals(groups: TypeGroup[]): MonthTotals {
  const of = (type: TransactionType) =>
    groups.filter((g) => g.type === type).reduce((acc, g) => acc + g.sum, 0);
  const income = of('INCOME');
  const expense = of('EXPENSE');
  const saved = of('SAVING');
  const count = groups
    .filter((g) => g.type !== 'SAVING_ADJUSTMENT')
    .reduce((acc, g) => acc + g.count, 0);
  return {
    income,
    expense,
    balance: income - expense,
    saved,
    free: income - expense - saved,
    count,
  };
}
