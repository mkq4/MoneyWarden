"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { transactionService } from "./transaction.service";
import type { TransactionFilters, UpdateTransactionRequest } from "./transaction.service.interface";

export const useTransactions = (filters: TransactionFilters, limit = 30) =>
  useInfiniteQuery({
    queryKey: [...QUERY_KEYS.transactions, filters, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => transactionService.list({ ...filters, page: pageParam, limit }),
    getNextPageParam: (last) => (last.page * last.limit < last.total ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

/** Всё, что зависит от операций, — пересчитать. */
function useInvalidateMoney() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: QUERY_KEYS.transactions }),
      client.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
      client.invalidateQueries({ queryKey: QUERY_KEYS.savings }),
    ]);
}

export function useCreateTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({ mutationFn: transactionService.create, onSuccess: invalidate });
}

export interface UpdateTransactionVariables {
  id: number;
  body: UpdateTransactionRequest;
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, body }: UpdateTransactionVariables) => transactionService.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({ mutationFn: transactionService.remove, onSuccess: invalidate });
}
