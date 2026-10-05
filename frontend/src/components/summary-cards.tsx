"use client";

import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TypeBadge } from "@/components/type-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { useSummary } from "@/lib/queries";
import type { TransactionType } from "@/lib/types";
import { useHrefWithMonth } from "@/lib/use-month";
import { cn } from "@/lib/utils";

export function SummaryCards({ month }: { month: string }) {
  const { data } = useSummary(month);
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6">
      <SummaryCard type="EXPENSE" amount={data?.expense} change={data?.change.expensePct} />
      <SummaryCard type="INCOME" amount={data?.income} change={data?.change.incomePct} />
    </div>
  );
}

function SummaryCard({
  type,
  amount,
  change,
}: {
  type: TransactionType;
  amount: number | undefined;
  change: number | null | undefined;
}) {
  const withMonth = useHrefWithMonth();
  const href = withMonth("/history", { type });
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-surface p-4 transition hover:border-border md:p-6"
    >
      <TypeBadge type={type} size="lg" className="hidden md:inline-flex" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-foreground/80 md:text-sm md:font-medium">
          {type === "INCOME" ? "Доходы" : "Расходы"}
        </div>
        {amount === undefined ? (
          <Skeleton className="mt-2 h-7 w-28" />
        ) : (
          <div className="mt-1 truncate text-lg font-semibold tracking-tight md:mt-1.5 md:text-[26px]">
            {formatMoney(amount)}
          </div>
        )}
        <Change type={type} pct={change} />
      </div>
      <ChevronRight className="mt-5 hidden size-4 text-muted-foreground transition group-hover:translate-x-0.5 md:block" />
    </Link>
  );
}

/** Для расходов рост — плохо (красный), для доходов — хорошо (зелёный). */
function Change({ type, pct }: { type: TransactionType; pct: number | null | undefined }) {
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

/** Вторая строка карточек месяца: «Отложено» и «Свободный остаток». */
export function MonthExtras({ month }: { month: string }) {
  const { data } = useSummary(month);
  const withMonth = useHrefWithMonth();
  const items = [
    { label: "Отложено", value: data?.saved, className: "text-brand" },
    { label: "Свободный остаток", value: data?.free, className: data && data.free < 0 ? "text-expense" : undefined },
  ];
  return (
    <Link
      href={withMonth("/stats")}
      className="group grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-surface px-4 py-3 transition hover:border-border md:flex md:items-center md:gap-10 md:px-6 md:py-4"
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 md:flex md:items-baseline md:gap-3">
          <div className="text-[13px] text-muted-foreground">{item.label}</div>
          {item.value === undefined ? (
            <Skeleton className="mt-1 h-5 w-20" />
          ) : (
            <div className={cn("truncate text-[15px] font-semibold md:text-base", item.className)}>
              {item.value < 0 ? "− " : ""}
              {formatMoney(item.value)}
            </div>
          )}
        </div>
      ))}
      <ChevronRight className="ml-auto hidden size-4 text-muted-foreground transition group-hover:translate-x-0.5 md:block" />
    </Link>
  );
}
