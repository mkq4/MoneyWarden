export type TransactionType = "INCOME" | "EXPENSE" | "SAVING" | "SAVING_ADJUSTMENT";
/** Типы, у которых есть категории */
export type CategoryType = "INCOME" | "EXPENSE";

export interface User {
  id: number;
  username: string | null;
  email: string | null;
  name: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  archivedAt: string | null;
}

export type CategoryRef = Pick<Category, "id" | "name" | "color" | "icon" | "archivedAt">;

export interface Transaction {
  id: number;
  type: TransactionType;
  /** копейки */
  amount: number;
  /** YYYY-MM-DD */
  date: string;
  comment: string | null;
  /** null у SAVING и SAVING_ADJUSTMENT */
  categoryId: number | null;
  category: CategoryRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  sums: { income: number; expense: number; saved: number };
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

export interface Savings {
  /** накоплено всего, копейки */
  total: number;
}

export interface Summary extends Totals {
  period: { from: string; to: string };
  previous: Totals & { period: { from: string; to: string } };
  change: { incomePct: number | null; expensePct: number | null };
}

export interface CategoryStats {
  total: number;
  type: CategoryType;
  items: { category: CategoryRef; total: number; count: number; share: number }[];
}

export interface MonthTotals {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface DailyStats {
  month: string;
  type: CategoryType;
  total: number;
  avgPerDay: number;
  maxDay: { date: string; total: number } | null;
  days: { date: string; total: number }[];
}
