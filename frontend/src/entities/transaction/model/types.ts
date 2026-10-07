import type { CategoryRef } from "@/entities/category/@x/transaction";

export type TransactionType = "INCOME" | "EXPENSE" | "SAVING" | "SAVING_ADJUSTMENT";

/** Операции с накоплениями: без категории */
export type SavingTransactionType = Extract<TransactionType, "SAVING" | "SAVING_ADJUSTMENT">;

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

export interface TransactionSums {
  income: number;
  expense: number;
  saved: number;
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  sums: TransactionSums;
}
