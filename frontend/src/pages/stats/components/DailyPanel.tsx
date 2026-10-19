"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import type { CategoryType } from "@/entities/category";
import { EmptyBreakdown, useDaily } from "@/entities/stats";
import { formatDay, formatDayShort, formatMoney, formatMoneyAxis } from "@/shared/lib/format";
import { ChartContainer, ChartTooltip } from "@/shared/ui/chart";
import { MoneyTooltip } from "@/shared/ui/money-tooltip";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { historyHref } from "../lib/history-href";
import { CHART_CONFIG, SERIES, SERIES_LABELS } from "../model/stats.const";
import { DailyFigure } from "./DailyFigure";
import { TypeSwitch } from "./TypeSwitch";

export function DailyPanel({ month }: { month: string }) {
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const { data } = useDaily(month, type);
  const series = type === "EXPENSE" ? "expense" : "income";
  const router = useRouter();

  return (
    <Panel>
      <PanelTitle action={<TypeSwitch value={type} onChange={setType} />}>По дням</PanelTitle>
      {!data ? (
        <Skeleton className="h-56 w-full" />
      ) : !data.total ? (
        <EmptyBreakdown type={type} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <DailyFigure label="Всего" value={formatMoney(data.total)} />
            <DailyFigure label="В среднем в день" value={formatMoney(data.avgPerDay)} />
            {data.maxDay && (
              <DailyFigure
                label="Самый крупный день"
                value={`${formatMoney(data.maxDay.total)} · ${formatDay(data.maxDay.date).toLowerCase()}`}
              />
            )}
          </div>
          <ChartContainer config={CHART_CONFIG} className="aspect-auto h-56 w-full">
            <BarChart
              data={data.days}
              barCategoryGap="18%"
              margin={{ left: 0, right: 0, top: 8 }}
              className="cursor-pointer"
              onClick={({ activeLabel }) => {
                // Тап по дню → история за этот день (пустые дни не открываем).
                const day = data.days.find((d) => d.date === activeLabel);
                if (day?.total) router.push(historyHref(month, { type, day: day.date }));
              }}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(d: string) => String(Number(d.slice(8)))}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatMoneyAxis} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", radius: 4 }}
                content={({ active, payload, label }) => (
                  <MoneyTooltip active={active} payload={payload} title={formatDayShort(String(label))} />
                )}
              />
              {data.avgPerDay > 0 && (
                <ReferenceLine
                  y={data.avgPerDay}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{ value: "среднее", position: "insideTopRight", fontSize: 11, fill: "var(--muted-foreground)" }}
                />
              )}
              <Bar dataKey="total" name={SERIES_LABELS[series]} fill={SERIES[series]} radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ChartContainer>
        </>
      )}
    </Panel>
  );
}
