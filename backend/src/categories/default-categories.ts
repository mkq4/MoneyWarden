import type { Prisma, TransactionType } from '../generated/prisma/client.js';

interface DefaultCategory {
  name: string;
  type: TransactionType;
  color: string;
  /** Имена иконок lucide (используются в shadcn/ui) */
  icon: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    type: 'EXPENSE',
    name: 'Продукты',
    color: '#22c55e',
    icon: 'shopping-cart',
  },
  {
    type: 'EXPENSE',
    name: 'Кафе и рестораны',
    color: '#f97316',
    icon: 'utensils',
  },
  { type: 'EXPENSE', name: 'Транспорт', color: '#3b82f6', icon: 'bus' },
  { type: 'EXPENSE', name: 'Жильё и ЖКХ', color: '#8b5cf6', icon: 'house' },
  { type: 'EXPENSE', name: 'Связь и интернет', color: '#06b6d4', icon: 'wifi' },
  { type: 'EXPENSE', name: 'Здоровье', color: '#ef4444', icon: 'heart-pulse' },
  { type: 'EXPENSE', name: 'Одежда', color: '#ec4899', icon: 'shirt' },
  { type: 'EXPENSE', name: 'Развлечения', color: '#eab308', icon: 'gamepad-2' },
  { type: 'EXPENSE', name: 'Подарки', color: '#f43f5e', icon: 'gift' },
  { type: 'EXPENSE', name: 'Другое', color: '#64748b', icon: 'ellipsis' },
  { type: 'INCOME', name: 'Зарплата', color: '#16a34a', icon: 'briefcase' },
  { type: 'INCOME', name: 'Подработка', color: '#0ea5e9', icon: 'laptop' },
  { type: 'INCOME', name: 'Подарки', color: '#f43f5e', icon: 'gift' },
  {
    type: 'INCOME',
    name: 'Кэшбэк и проценты',
    color: '#a855f7',
    icon: 'percent',
  },
  { type: 'INCOME', name: 'Другое', color: '#64748b', icon: 'ellipsis' },
];

/** Вызывается в той же транзакции, что и создание пользователя. */
export async function createDefaultCategories(
  tx: Prisma.TransactionClient,
  userId: number,
): Promise<void> {
  await tx.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
  });
}
