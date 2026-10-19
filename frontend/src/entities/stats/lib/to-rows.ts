import { OTHER_COLOR } from "../model/stats.const";
import type { BreakdownRow, CategoryStats } from "../model/types";

/** Топ-N категорий, остальное сворачивается в «Остальное» (как в макете). */
export function toBreakdownRows(stats: CategoryStats, limit?: number): BreakdownRow[] {
  const rows: BreakdownRow[] = stats.items.map((i) => ({
    key: String(i.category.id),
    categoryIds: [i.category.id],
    name: i.category.name,
    icon: i.category.icon,
    color: i.category.color ?? OTHER_COLOR,
    total: i.total,
    share: i.share,
    count: i.count,
  }));
  if (!limit || rows.length <= limit + 1) return rows;
  const rest = rows.slice(limit);
  return [
    ...rows.slice(0, limit),
    {
      key: "other",
      categoryIds: rest.flatMap((r) => r.categoryIds),
      name: "Остальное",
      icon: "ellipsis",
      color: OTHER_COLOR,
      total: rest.reduce((a, r) => a + r.total, 0),
      share: rest.reduce((a, r) => a + r.share, 0),
      count: rest.reduce((a, r) => a + r.count, 0),
    },
  ];
}
