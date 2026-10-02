export type TransactionType = "INCOME" | "EXPENSE";

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
  type: TransactionType;
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
  categoryId: number;
  category: CategoryRef;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  sums: { income: number; expense: number };
}

export interface Totals {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface Summary extends Totals {
  period: { from: string; to: string };
  previous: Totals & { period: { from: string; to: string } };
  change: { incomePct: number | null; expensePct: number | null };
}

export interface CategoryStats {
  total: number;
  type: TransactionType;
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
  type: TransactionType;
  total: number;
  avgPerDay: number;
  maxDay: { date: string; total: number } | null;
  days: { date: string; total: number }[];
}
