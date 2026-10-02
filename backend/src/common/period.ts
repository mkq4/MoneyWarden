import { BadRequestException } from '@nestjs/common';

/**
 * Даты операций хранятся как DATE (без времени). В JS это Date на полночь UTC,
 * поэтому вся арифметика здесь — в UTC.
 */
export interface Period {
  /** включительно */
  from: Date;
  /** включительно */
  to: Date;
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PERIOD_DAYS = 366 * 5;

export function parseDate(value: string): Date {
  const date = new Date(`${value}T00:00:00Z`);
  if (!DATE_RE.test(value) || formatDate(date) !== value) {
    throw new BadRequestException(`Некорректная дата: ${value}`);
  }
  return date;
}

export const formatDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

export const formatMonth = (date: Date): string =>
  date.toISOString().slice(0, 7);

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * DAY_MS);

/** Количество дней в периоде, обе границы включительно. */
export const periodDays = ({ from, to }: Period): number =>
  Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;

export const today = (now = new Date()): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

export function monthPeriod(month: string): Period {
  if (!MONTH_RE.test(month)) {
    throw new BadRequestException(`Некорректный месяц: ${month}`);
  }
  const [y, m] = month.split('-').map(Number);
  return {
    from: new Date(Date.UTC(y, m - 1, 1)),
    to: new Date(Date.UTC(y, m, 0)),
  };
}

export const currentMonth = (now = new Date()): string => formatMonth(now);

/** Сдвиг месяца 'YYYY-MM' на delta месяцев. */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  return formatMonth(new Date(Date.UTC(y, m - 1 + delta, 1)));
}

/** Последние n месяцев, заканчивая last, по возрастанию. */
export function lastMonths(n: number, last: string): string[] {
  return Array.from({ length: n }, (_, i) => shiftMonth(last, i - n + 1));
}

export function isWholeMonth({ from, to }: Period): boolean {
  const month = monthPeriod(formatMonth(from));
  return (
    month.from.getTime() === from.getTime() &&
    month.to.getTime() === to.getTime()
  );
}

/**
 * Период для сравнения: для календарного месяца — предыдущий месяц,
 * иначе — период той же длины непосредственно перед from.
 */
export function previousPeriod(period: Period): Period {
  if (isWholeMonth(period)) {
    return monthPeriod(shiftMonth(formatMonth(period.from), -1));
  }
  const to = addDays(period.from, -1);
  return { from: addDays(to, -(periodDays(period) - 1)), to };
}

export interface PeriodInput {
  month?: string;
  from?: string;
  to?: string;
}

/** month приоритетнее from/to; без параметров — текущий месяц. */
export function resolvePeriod(input: PeriodInput, now = new Date()): Period {
  if (input.month) return monthPeriod(input.month);
  if (!input.from && !input.to) return monthPeriod(currentMonth(now));
  if (!input.from || !input.to) {
    throw new BadRequestException('Нужно указать и from, и to');
  }
  const period = { from: parseDate(input.from), to: parseDate(input.to) };
  if (period.from > period.to) {
    throw new BadRequestException('from должен быть не позже to');
  }
  if (periodDays(period) > MAX_PERIOD_DAYS) {
    throw new BadRequestException('Слишком длинный период');
  }
  return period;
}
