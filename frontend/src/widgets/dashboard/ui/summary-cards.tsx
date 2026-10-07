"use client";

import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CategoryType } from "@/entities/category";
import { useSummary } from "@/entities/stats";
import { TypeBadge } from "@/entities/transaction";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import { Skeleton } from "@/shared/ui/skeleton";

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
  type: CategoryType;
  amount: number | undefined;
  change: number | null | undefined;
}) {
  const withMonth = useHrefWithMonth();
  const href = withMonth(ROUTES.history, { type });
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
function Change({ type, pct }: { type: CategoryType; pct: number | null | undefined }) {
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
