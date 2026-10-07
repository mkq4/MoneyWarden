"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { savingsService } from "./savings.service";

export const useSavings = () => useQuery({ queryKey: QUERY_KEYS.savings, queryFn: savingsService.get });

export function useSetSavingsBalance() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: savingsService.setBalance,
    // Корректировка — это операция: меняются история, статистика и накопления.
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: QUERY_KEYS.transactions }),
        client.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
        client.invalidateQueries({ queryKey: QUERY_KEYS.savings }),
      ]),
  });
}
