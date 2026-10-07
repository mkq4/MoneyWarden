import { isCategoryRef } from "@/entities/category/@x/transaction";
import { arrayOf, isNumber, isString, literal, nullable, shape, type Guard } from "@/shared/lib/guards";
import type { SavingTransactionType, Transaction, TransactionPage, TransactionType } from "./types";

export const isTransactionType: Guard<TransactionType> = literal(
  "INCOME",
  "EXPENSE",
  "SAVING",
  "SAVING_ADJUSTMENT",
);

export const isSavingType: Guard<SavingTransactionType> = literal("SAVING", "SAVING_ADJUSTMENT");

export const isTransaction: Guard<Transaction> = shape<Transaction>({
  id: isNumber,
  type: isTransactionType,
  amount: isNumber,
  date: isString,
  comment: nullable(isString),
  categoryId: nullable(isNumber),
  category: nullable(isCategoryRef),
  createdAt: isString,
  updatedAt: isString,
});

export const isTransactionPage: Guard<TransactionPage> = shape<TransactionPage>({
  items: arrayOf(isTransaction),
  total: isNumber,
  page: isNumber,
  limit: isNumber,
  sums: shape<TransactionPage["sums"]>({ income: isNumber, expense: isNumber, saved: isNumber }),
});
