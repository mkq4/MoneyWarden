"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSummary } from "@/entities/stats";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import { Skeleton } from "@/shared/ui/skeleton";

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
      href={withMonth(ROUTES.stats)}
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
