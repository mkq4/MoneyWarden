"use client";

import { Cell, Pie, PieChart } from "recharts";
import { CategoryIcon } from "@/components/category-icon";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import type { CategoryStats, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const OTHER_COLOR = "#94a3b8";

interface Row {
  key: string;
  name: string;
  icon: string | null;
  color: string;
  total: number;
  share: number;
  count: number;
}

/** Топ-N категорий, остальное сворачивается в «Другое» (как в макете). */
export function toRows(stats: CategoryStats, limit?: number): Row[] {
  const rows: Row[] = stats.items.map((i) => ({
    key: String(i.category.id),
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
      name: "Остальное",
      icon: "ellipsis",
      color: OTHER_COLOR,
      total: rest.reduce((a, r) => a + r.total, 0),
      share: rest.reduce((a, r) => a + r.share, 0),
      count: rest.reduce((a, r) => a + r.count, 0),
    },
  ];
}

export function Donut({ rows, total, className }: { rows: Row[]; total: number; className?: string }) {
  return (
    <div className={cn("relative aspect-square w-full max-w-[240px]", className)}>
      <ChartContainer config={{}} className="aspect-square h-full w-full">
        <PieChart>
          <Pie
            data={rows.length ? rows : [{ key: "empty", total: 1, color: "#e5e7eb" }]}
            dataKey="total"
            nameKey="name"
            innerRadius="68%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="var(--surface)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {(rows.length ? rows : [{ key: "empty", color: "#eef0f2" }]).map((r) => (
              <Cell key={r.key} fill={r.color} fillOpacity={r.key === "empty" ? 1 : 0.55} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-semibold tracking-tight md:text-xl">{formatMoney(total)}</div>
        <div className="text-xs text-muted-foreground">всего</div>
      </div>
    </div>
  );
}

export function CategoryBars({ rows, compact = false }: { rows: Row[]; compact?: boolean }) {
  return (
    <ul className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      {rows.map((r) => {
        const pct = Math.round(r.share * 100);
        return (
          <li key={r.key} className="flex items-center gap-3">
            <CategoryIcon icon={r.icon} color={r.color} size={compact ? "sm" : "md"} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm">{r.name}</span>
                <span className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(r.total)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: r.color, opacity: 0.75 }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{pct}%</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function BreakdownSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyBreakdown({ type }: { type: TransactionType }) {
  return (
    <div className="py-8 text-center text-sm text-muted-foreground">
      {type === "INCOME" ? "Доходов" : "Расходов"} за этот период пока нет
    </div>
  );
}
