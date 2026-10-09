"use client";

import { useSummary } from "@/entities/stats";
import { SummaryCard } from "./SummaryCard";

export function SummaryCards({ month }: { month: string }) {
  const { data } = useSummary(month);
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6">
      <SummaryCard type="EXPENSE" amount={data?.expense} change={data?.change.expensePct} />
      <SummaryCard type="INCOME" amount={data?.income} change={data?.change.incomePct} />
    </div>
  );
}
