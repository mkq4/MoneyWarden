import { CategoryIcon } from "@/entities/category/@x/stats";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import type { BreakdownRow } from "../model/types";

export function CategoryBars({ rows, compact = false }: { rows: BreakdownRow[]; compact?: boolean }) {
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
