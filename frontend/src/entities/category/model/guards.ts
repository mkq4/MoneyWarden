import { isNumber, isString, literal, nullable, shape, type Guard } from "@/shared/lib/guards";
import type { Category, CategoryRef, CategoryType } from "./types";

export const isCategoryType: Guard<CategoryType> = literal("INCOME", "EXPENSE");

export const isCategoryRef: Guard<CategoryRef> = shape<CategoryRef>({
  id: isNumber,
  name: isString,
  color: nullable(isString),
  icon: nullable(isString),
  archivedAt: nullable(isString),
});

export const isCategory: Guard<Category> = shape<Category>({
  id: isNumber,
  name: isString,
  type: isCategoryType,
  color: nullable(isString),
  icon: nullable(isString),
  archivedAt: nullable(isString),
});
