"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CategoryType } from "@/entities/category";
import { TypeBadge } from "@/entities/transaction";
import { ROUTES } from "@/shared/config";
import { formatMoney } from "@/shared/lib/format";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import { Skeleton } from "@/shared/ui/skeleton";
import { SummaryChange } from "./SummaryChange";

export function SummaryCard({
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
        <SummaryChange type={type} pct={change} />
      </div>
      <ChevronRight className="mt-5 hidden size-4 text-muted-foreground transition group-hover:translate-x-0.5 md:block" />
    </Link>
  );
}
