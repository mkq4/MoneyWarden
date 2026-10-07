"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CategoryType } from "@/entities/category/@x/stats";
import { QUERY_KEYS } from "@/shared/api";
import { statsService } from "./stats.service";

export const useSummary = (month: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.stats, "summary", month],
    queryFn: () => statsService.getSummary({ month }),
    placeholderData: keepPreviousData,
  });

export const useCategoryStats = (month: string, type: CategoryType = "EXPENSE") =>
  useQuery({
    queryKey: [...QUERY_KEYS.stats, "categories", month, type],
    queryFn: () => statsService.getCategories({ month, type }),
    placeholderData: keepPreviousData,
  });

export const useMonthly = (until: string, months = 12) =>
  useQuery({
    queryKey: [...QUERY_KEYS.stats, "monthly", until, months],
    queryFn: () => statsService.getMonthly({ until, months }),
    placeholderData: keepPreviousData,
  });

export const useDaily = (month: string, type: CategoryType = "EXPENSE") =>
  useQuery({
    queryKey: [...QUERY_KEYS.stats, "daily", month, type],
    queryFn: () => statsService.getDaily({ month, type }),
    placeholderData: keepPreviousData,
  });
