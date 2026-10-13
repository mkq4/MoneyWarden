/**
 * Корни ключей react-query. Общие для всех сущностей, чтобы мутации одной
 * сущности могли сбрасывать кэш других без кросс-импортов между слайсами.
 */
export const QUERY_KEYS = {
  me: ["me"],
  categories: ["categories"],
  transactions: ["transactions"],
  stats: ["stats"],
  savings: ["savings"],
  reminders: ["reminders"],
} satisfies Record<string, readonly string[]>;
