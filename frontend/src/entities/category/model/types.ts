/** Типы операций, у которых есть категории */
export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  archivedAt: string | null;
}

/** Категория в составе операции или статистики */
export type CategoryRef = Pick<Category, "id" | "name" | "color" | "icon" | "archivedAt">;
