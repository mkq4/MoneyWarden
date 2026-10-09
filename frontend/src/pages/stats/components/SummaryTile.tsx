import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import { Skeleton } from "@/shared/ui/skeleton";

/** Плитка итога месяца: сумма, изменение к прошлому месяцу или подсказка. */
export function SummaryTile({
  label,
  value,
  change,
  goodWhenUp,
  hint,
  signed,
  valueClassName,
  className,
}: {
  className?: string;
  label: string;
  value: number | undefined;
  change?: number | null;
  goodWhenUp?: boolean;
  hint?: string;
  signed?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-2xl border border-border/80 bg-surface p-4 md:p-5", className)}>
      <div className="text-[13px] text-muted-foreground">{label}</div>
      {value === undefined ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <div
          className={cn(
            "mt-1 truncate text-lg font-semibold tracking-tight md:text-2xl",
            signed && value < 0 && "text-expense",
            valueClassName,
          )}
        >
          {signed && value < 0 ? "− " : ""}
          {formatMoney(value)}
        </div>
      )}
      <div className="mt-1 min-h-4 text-xs">
        {change !== undefined && change !== null && change !== 0 ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              (change > 0) === goodWhenUp ? "text-income" : "text-expense",
            )}
            title="по сравнению с прошлым месяцем"
          >
            {change > 0 ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
            {Math.abs(change).toLocaleString("ru-RU")}%
            <span className="ml-1 font-normal whitespace-nowrap text-muted-foreground lg:hidden">к прошлому месяцу</span>
          </span>
        ) : (
          hint && <span className="text-muted-foreground">{hint}</span>
        )}
      </div>
    </div>
  );
}
