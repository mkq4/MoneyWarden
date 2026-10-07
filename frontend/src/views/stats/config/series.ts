import type { ChartConfig } from "@/shared/ui/chart";

export type SeriesKey = "income" | "expense";

export const SERIES_KEYS: SeriesKey[] = ["income", "expense"];

/** Пара проверена валидатором палитр: различима при дейтеранопии/протанопии. */
export const SERIES: Record<SeriesKey, string> = { expense: "#f07a7a", income: "#237a45" };

export const SERIES_LABELS: Record<SeriesKey, string> = { expense: "Расходы", income: "Доходы" };

export const chartConfig = {
  expense: { label: SERIES_LABELS.expense, color: SERIES.expense },
  income: { label: SERIES_LABELS.income, color: SERIES.income },
} satisfies ChartConfig;
