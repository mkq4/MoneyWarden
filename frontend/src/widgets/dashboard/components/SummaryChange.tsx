import { ArrowDown, ArrowUp } from "lucide-react";
import type { CategoryType } from "@/entities/category";
import { cn } from "@/shared/lib/cn";

/** Для расходов рост — плохо (красный), для доходов — хорошо (зелёный). */
export function SummaryChange({ type, pct }: { type: CategoryType; pct: number | null | undefined }) {
  if (pct === undefined) return <div className="mt-1.5 h-4" />;
  if (pct === null || pct === 0) {
    return <div className="mt-1 text-xs text-muted-foreground md:mt-2">{pct === 0 ? "как в прошлом месяце" : " "}</div>;
  }
  const up = pct > 0;
  const good = type === "INCOME" ? up : !up;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <div
      className={cn(
        "mt-1 flex items-center gap-0.5 text-xs font-medium md:mt-2",
        good ? "text-income" : "text-expense",
      )}
      title="по сравнению с прошлым месяцем"
    >
      <Arrow className="size-3.5" strokeWidth={2.5} />
      {Math.abs(pct).toLocaleString("ru-RU")}%
    </div>
  );
}
