import type { Category, CategoryType } from "../model/types";

/** GET /categories */
export interface ListCategoriesRequest {
  type?: CategoryType;
  includeArchived?: boolean;
}
export type ListCategoriesResponse = Category[];

/** POST /categories */
export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  /** #RRGGBB */
  color?: string;
  icon?: string;
}
export type CreateCategoryResponse = Category;

/** PATCH /categories/:id — тип категории менять нельзя. */
export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
  /** false — восстановить из архива */
  archived?: boolean;
}
export type UpdateCategoryResponse = Category;

/** DELETE /categories/:id — категорию с операциями бэкенд архивирует, пустую удаляет. */
export type DeleteCategoryResponse = { archived: true } | { deleted: true };

export interface ICategoryService {
  list(params: ListCategoriesRequest): Promise<ListCategoriesResponse>;
  create(body: CreateCategoryRequest): Promise<CreateCategoryResponse>;
  update(id: number, body: UpdateCategoryRequest): Promise<UpdateCategoryResponse>;
  remove(id: number): Promise<DeleteCategoryResponse>;
}
