"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { categoryService } from "./category.service";
import type { ListCategoriesRequest, UpdateCategoryRequest } from "./category.service.interface";

export const useCategories = (params: ListCategoriesRequest = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.categories, params],
    queryFn: () => categoryService.list(params),
  });

/** Название и цвет категории видны в истории и статистике — их тоже пересчитать. */
function useInvalidateCategories() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: QUERY_KEYS.categories }),
      client.invalidateQueries({ queryKey: QUERY_KEYS.transactions }),
      client.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
    ]);
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({ mutationFn: categoryService.create, onSuccess: invalidate });
}

export interface UpdateCategoryVariables {
  id: number;
  body: UpdateCategoryRequest;
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, body }: UpdateCategoryVariables) => categoryService.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: QUERY_KEYS.categories }),
  });
}
