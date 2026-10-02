"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, qs } from "./api";
import type {
  Category,
  CategoryStats,
  DailyStats,
  MonthTotals,
  Summary,
  Transaction,
  TransactionPage,
  TransactionType,
  User,
} from "./types";

export const useMe = () =>
  useQuery({ queryKey: ["me"], queryFn: () => api<User>("/auth/me"), staleTime: Infinity });

export const useCategories = (opts: { type?: TransactionType; includeArchived?: boolean } = {}) =>
  useQuery({
    queryKey: ["categories", opts],
    queryFn: () =>
      api<Category[]>(
        `/categories${qs({ type: opts.type, includeArchived: opts.includeArchived ? "true" : undefined })}`,
      ),
  });

export const useSummary = (month: string) =>
  useQuery({
    queryKey: ["stats", "summary", month],
    queryFn: () => api<Summary>(`/stats/summary${qs({ month })}`),
    placeholderData: keepPreviousData,
  });

export const useCategoryStats = (month: string, type: TransactionType = "EXPENSE") =>
  useQuery({
    queryKey: ["stats", "categories", month, type],
    queryFn: () => api<CategoryStats>(`/stats/categories${qs({ month, type })}`),
    placeholderData: keepPreviousData,
  });

export const useMonthly = (until: string, months = 12) =>
  useQuery({
    queryKey: ["stats", "monthly", until, months],
    queryFn: () => api<MonthTotals[]>(`/stats/monthly${qs({ until, months })}`),
    placeholderData: keepPreviousData,
  });

export const useDaily = (month: string, type: TransactionType = "EXPENSE") =>
  useQuery({
    queryKey: ["stats", "daily", month, type],
    queryFn: () => api<DailyStats>(`/stats/daily${qs({ month, type })}`),
    placeholderData: keepPreviousData,
  });

export interface TransactionFilters {
  month?: string;
  type?: TransactionType;
  categoryIds?: number[];
  search?: string;
}

export const useTransactions = (filters: TransactionFilters, limit = 30) =>
  useInfiniteQuery({
    queryKey: ["transactions", filters, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      api<TransactionPage>(
        `/transactions${qs({
          month: filters.month,
          type: filters.type,
          categoryIds: filters.categoryIds?.join(","),
          search: filters.search,
          page: pageParam,
          limit,
        })}`,
      ),
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });

/** Всё, что зависит от операций, — пересчитать. */
function useInvalidateMoney() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["transactions"] }),
      client.invalidateQueries({ queryKey: ["stats"] }),
    ]);
}

export interface TransactionInput {
  categoryId: number;
  amount: number;
  date: string;
  comment?: string | null;
}

export function useSaveTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, ...body }: TransactionInput & { id?: number }) =>
      id
        ? api<Transaction>(`/transactions/${id}`, { method: "PATCH", body })
        : api<Transaction>("/transactions", { method: "POST", body }),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (id: number) => api(`/transactions/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export interface CategoryInput {
  name?: string;
  type?: TransactionType;
  color?: string;
  icon?: string;
  archived?: boolean;
}

export function useSaveCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: CategoryInput & { id?: number }) =>
      id
        ? api<Category>(`/categories/${id}`, { method: "PATCH", body })
        : api<Category>("/categories", { method: "POST", body }),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["categories"] }),
        // название/цвет категории видны в истории и статистике
        client.invalidateQueries({ queryKey: ["transactions"] }),
        client.invalidateQueries({ queryKey: ["stats"] }),
      ]),
  });
}

export function useDeleteCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api<{ archived?: true; deleted?: true }>(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSettled: () => {
      // Полная перезагрузка: proxy перечитает куку сессии, кэш запросов сбросится.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    },
  });
}
