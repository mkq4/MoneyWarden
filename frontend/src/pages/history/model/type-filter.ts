import type { CategoryType } from "@/entities/category";

/** Фильтр истории по типу: доходы, расходы или все операции. */
export type TypeFilter = CategoryType | "ALL";

export const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "EXPENSE", label: "Расходы" },
  { value: "INCOME", label: "Доходы" },
];
