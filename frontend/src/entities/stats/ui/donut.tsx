"use client";

import { Cell, Pie, PieChart } from "recharts";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import { ChartContainer } from "@/shared/ui/chart";
import type { BreakdownRow } from "../model/types";

const EMPTY_ROWS = [{ key: "empty", name: "", total: 1, color: "#eef0f2" }];

export function Donut({ rows, total, className }: { rows: BreakdownRow[]; total: number; className?: string }) {
  const data = rows.length ? rows : EMPTY_ROWS;
  return (
    <div className={cn("relative aspect-square w-full max-w-[240px]", className)}>
      <ChartContainer config={{}} className="aspect-square h-full w-full">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            innerRadius="68%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="var(--surface)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((r) => (
              <Cell key={r.key} fill={r.color} fillOpacity={r.key === "empty" ? 1 : 0.55} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-semibold tracking-tight md:text-xl">{formatMoney(total)}</div>
        <div className="text-xs text-muted-foreground">всего</div>
      </div>
    </div>
  );
}
