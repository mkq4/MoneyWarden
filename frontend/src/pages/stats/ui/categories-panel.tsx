"use client";

import { useState } from "react";
import type { CategoryType } from "@/entities/category";
import {
  BreakdownSkeleton,
  CategoryBars,
  Donut,
  EmptyBreakdown,
  toBreakdownRows,
  useCategoryStats,
} from "@/entities/stats";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { TypeSwitch } from "./type-switch";

export function CategoriesPanel({ month }: { month: string }) {
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const { data } = useCategoryStats(month, type);
  const rows = data ? toBreakdownRows(data) : [];
  return (
    <Panel>
      <PanelTitle action={<TypeSwitch value={type} onChange={setType} />}>По категориям</PanelTitle>
      {!data ? (
        <BreakdownSkeleton />
      ) : !rows.length ? (
        <EmptyBreakdown type={type} />
      ) : (
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <Donut
            rows={rows.length > 8 ? toBreakdownRows(data, 7) : rows}
            total={data.total}
            className="w-[220px] md:w-[260px] md:max-w-[260px]"
          />
          <div className="w-full md:flex-1">
            <CategoryBars rows={rows} />
          </div>
        </div>
      )}
    </Panel>
  );
}
