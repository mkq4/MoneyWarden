import type { CategoryType } from "@/entities/category";
import type { ChartConfig } from "@/shared/ui/chart";
import type { SeriesKey } from "./types";

export const SERIES_KEYS: SeriesKey[] = ["income", "expense"];

/** Цвета — в globals.scss (--series-*), свои для каждой темы; пары различимы при дейтеранопии/протанопии. */
export const SERIES: Record<SeriesKey, string> = {
  expense: "var(--series-expense)",
  income: "var(--series-income)",
};

export const SERIES_LABELS: Record<SeriesKey, string> = { expense: "Расходы", income: "Доходы" };

export const CHART_CONFIG = {
  expense: { label: SERIES_LABELS.expense, color: SERIES.expense },
  income: { label: SERIES_LABELS.income, color: SERIES.income },
} satisfies ChartConfig;

/** Переключатель «Расходы / Доходы» в панелях статистики */
export const TYPE_SWITCH_OPTIONS: CategoryType[] = ["EXPENSE", "INCOME"];
