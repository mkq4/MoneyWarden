import type { TransactionType } from '../generated/prisma/client.js';

/** Типы, у которых есть категории (и которые бывают у самих категорий). */
export const CATEGORY_TYPES = [
  'INCOME',
  'EXPENSE',
] as const satisfies readonly TransactionType[];
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const CATEGORY_TYPE_MESSAGE = 'type должен быть INCOME или EXPENSE';
