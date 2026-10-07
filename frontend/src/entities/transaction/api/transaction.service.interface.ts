import type { Transaction, TransactionPage, TransactionType } from "../model/types";

/** GET /transactions — фильтры списка */
export interface TransactionFilters {
  /** YYYY-MM */
  month?: string;
  type?: TransactionType;
  categoryIds?: number[];
  /** поиск по комментарию */
  search?: string;
}

export interface ListTransactionsRequest extends TransactionFilters {
  page: number;
  limit: number;
}
export type ListTransactionsResponse = TransactionPage;

interface CreateTransactionBase {
  /** копейки */
  amount: number;
  /** YYYY-MM-DD */
  date: string;
  comment?: string | null;
}

/** POST /transactions: доход/расход — тип определяется категорией. */
export interface CreateCategorizedTransactionRequest extends CreateTransactionBase {
  categoryId: number;
}

/** POST /transactions: «Отложить» — без категории. */
export interface CreateSavingTransactionRequest extends CreateTransactionBase {
  type: "SAVING";
}

export type CreateTransactionRequest = CreateCategorizedTransactionRequest | CreateSavingTransactionRequest;
export type CreateTransactionResponse = Transaction;

/** PATCH /transactions/:id — только изменяемые поля, тип не передаётся. */
export interface UpdateTransactionRequest {
  categoryId?: number;
  amount?: number;
  date?: string;
  /** null — удалить комментарий */
  comment?: string | null;
}
export type UpdateTransactionResponse = Transaction;

/** DELETE /transactions/:id */
export interface DeleteTransactionResponse {
  deleted: true;
}

export interface ITransactionService {
  list(params: ListTransactionsRequest): Promise<ListTransactionsResponse>;
  create(body: CreateTransactionRequest): Promise<CreateTransactionResponse>;
  update(id: number, body: UpdateTransactionRequest): Promise<UpdateTransactionResponse>;
  remove(id: number): Promise<DeleteTransactionResponse>;
}
