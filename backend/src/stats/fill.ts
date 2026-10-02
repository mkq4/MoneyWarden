import {
  addDays,
  formatDate,
  periodDays,
  type Period,
} from '../common/period.js';

export interface MonthTotals {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

/** Строки из БД (месяц × тип) → ряд по всем месяцам, пустые = 0. */
export function fillMonths(
  months: string[],
  rows: { month: string; type: string; total: number }[],
): MonthTotals[] {
  return months.map((month) => {
    const sum = (type: string) =>
      rows.find((r) => r.month === month && r.type === type)?.total ?? 0;
    const income = sum('INCOME');
    const expense = sum('EXPENSE');
    return { month, income, expense, balance: income - expense };
  });
}

/** Суммы по датам → ряд по каждому дню периода, пустые = 0. */
export function fillDays(
  period: Period,
  rows: { date: string; total: number }[],
): { date: string; total: number }[] {
  const byDate = new Map(rows.map((r) => [r.date, r.total]));
  return Array.from({ length: periodDays(period) }, (_, i) => {
    const date = formatDate(addDays(period.from, i));
    return { date, total: byDate.get(date) ?? 0 };
  });
}

/** Изменение в процентах с одним знаком после запятой; null, если базы нет. */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
