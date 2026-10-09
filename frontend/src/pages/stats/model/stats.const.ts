import type { CategoryType } from "@/entities/category";
import type { ChartConfig } from "@/shared/ui/chart";
import type { SeriesKey } from "./types";

export const SERIES_KEYS: SeriesKey[] = ["income", "expense"];

/** Пара проверена валидатором палитр: различима при дейтеранопии/протанопии. */
export const SERIES: Record<SeriesKey, string> = { expense: "#f07a7a", income: "#237a45" };

export const SERIES_LABELS: Record<SeriesKey, string> = { expense: "Расходы", income: "Доходы" };

export const CHART_CONFIG = {
  expense: { label: SERIES_LABELS.expense, color: SERIES.expense },
  income: { label: SERIES_LABELS.income, color: SERIES.income },
} satisfies ChartConfig;

/** Переключатель «Расходы / Доходы» в панелях статистики */
export const TYPE_SWITCH_OPTIONS: CategoryType[] = ["EXPENSE", "INCOME"];
