"use client";

import {
  BreakdownSkeleton,
  CategoryBars,
  Donut,
  EmptyBreakdown,
  toBreakdownRows,
  useCategoryStats,
} from "@/entities/stats";

export function ExpenseBreakdown({ month }: { month: string }) {
  const { data } = useCategoryStats(month, "EXPENSE");
  if (!data) return <BreakdownSkeleton />;
  if (!data.items.length) return <EmptyBreakdown type="EXPENSE" />;
  const rows = toBreakdownRows(data, 4);
  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
      <Donut rows={rows} total={data.total} className="hidden md:block md:w-[44%]" />
      <div className="w-full md:flex-1">
        <CategoryBars rows={rows} />
      </div>
    </div>
  );
}
