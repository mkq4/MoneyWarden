import type { CategoryRef, CategoryType } from "@/entities/category/@x/stats";

/** Период YYYY-MM-DD, обе границы включительно */
export interface Period {
  from: string;
  to: string;
}

export interface Totals {
  income: number;
  expense: number;
  /** income - expense */
  balance: number;
  /** отложено в накопления за период */
  saved: number;
  /** свободный остаток: income - expense - saved */
  free: number;
  count: number;
}

export interface Summary extends Totals {
  period: Period;
  previous: Totals & { period: Period };
  change: { incomePct: number | null; expensePct: number | null };
}

export interface CategoryStatsItem {
  category: CategoryRef;
  total: number;
  count: number;
  /** доля от total, 0..1 */
  share: number;
}

export interface CategoryStats {
  total: number;
  type: CategoryType;
  items: CategoryStatsItem[];
}

export interface MonthTotals {
  /** YYYY-MM */
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface DayTotal {
  /** YYYY-MM-DD */
  date: string;
  total: number;
}

export interface DailyStats {
  month: string;
  type: CategoryType;
  total: number;
  avgPerDay: number;
  maxDay: DayTotal | null;
  days: DayTotal[];
}

/** Строка разбивки по категориям (донат и полосы) */
export interface BreakdownRow {
  key: string;
  /** Id категорий строки: одна, или несколько у «Остальное». */
  categoryIds: number[];
  name: string;
  icon: string | null;
  color: string;
  total: number;
  share: number;
  count: number;
}
