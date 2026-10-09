"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useMonthly } from "@/entities/stats";
import { currentMonth, formatMoneyAxis, formatMonth, formatMonthShort } from "@/shared/lib/format";
import { ChartContainer, ChartTooltip } from "@/shared/ui/chart";
import { MoneyTooltip } from "@/shared/ui/money-tooltip";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { CHART_CONFIG, SERIES, SERIES_KEYS, SERIES_LABELS } from "../model/stats.const";
import { SeriesLegend } from "./SeriesLegend";

export function MonthlyPanel({ month }: { month: string }) {
  // Ряд заканчивается выбранным месяцем (или текущим, если выбран прошлый — тогда видно и «после»).
  const until = month < currentMonth() ? currentMonth() : month;
  const { data } = useMonthly(until, 12);
  const hasData = data?.some((m) => m.income || m.expense);

  return (
    <Panel>
      <PanelTitle action={<SeriesLegend />}>Доходы и расходы за год</PanelTitle>
      {!data ? (
        <Skeleton className="h-64 w-full" />
      ) : !hasData ? (
        <div className="py-14 text-center text-sm text-muted-foreground">Пока нет данных</div>
      ) : (
        <ChartContainer config={CHART_CONFIG} className="aspect-auto h-64 w-full">
          <BarChart data={data} barGap={2} barCategoryGap="22%" margin={{ left: 0, right: 0, top: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatMonthShort}
              interval="preserveStartEnd"
            />
            <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatMoneyAxis} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", radius: 6 }}
              content={({ active, payload, label }) => (
                <MoneyTooltip active={active} payload={payload} title={formatMonth(String(label))} />
              )}
            />
            {SERIES_KEYS.map((key) => (
              <Bar key={key} dataKey={key} name={SERIES_LABELS[key]} fill={SERIES[key]} radius={[4, 4, 0, 0]} maxBarSize={18}>
                {data.map((m) => (
                  <Cell key={m.month} fillOpacity={m.month === month ? 1 : 0.55} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      )}
    </Panel>
  );
}
