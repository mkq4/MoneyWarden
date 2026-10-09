import type { CategoryType } from "@/entities/category";

/** Фильтр истории по типу: доходы, расходы или все операции. */
export type TypeFilter = CategoryType | "ALL";
