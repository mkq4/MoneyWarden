import type { Category, CategoryType } from "@/entities/category";

/** Что редактируем: существующую категорию или новую заданного типа; null — диалог закрыт. */
export type EditorTarget = { category: Category } | { type: CategoryType } | null;
