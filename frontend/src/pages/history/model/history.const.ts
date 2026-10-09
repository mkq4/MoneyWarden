import type { TypeFilter } from "./types";

export const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "EXPENSE", label: "Расходы" },
  { value: "INCOME", label: "Доходы" },
];
