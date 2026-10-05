"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import { CategoryBars, Donut, EmptyBreakdown, BreakdownSkeleton, toRows } from "@/components/category-breakdown";
import { MoneyTooltip, axisMoney } from "@/components/chart-tooltip";
import { MonthPicker } from "@/components/month-picker";
import { SavingsPanel } from "@/components/savings-panel";
import { PageHeader } from "@/components/page-header";
import { Panel, PanelTitle } from "@/components/panel";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  currentMonth,
  formatDay,
  formatDayShort,
  formatMoney,
  formatMonth,
  formatMonthShort,
  pluralize,
} from "@/lib/format";
import { useCategoryStats, useDaily, useMonthly, useSummary } from "@/lib/queries";
import type { CategoryType } from "@/lib/types";
import { useMonth } from "@/lib/use-month";
import { cn } from "@/lib/utils";

/** Пара проверена валидатором палитр: различима при дейтеранопии/протанопии. */
const SERIES = { expense: "#f07a7a", income: "#237a45" };

const chartConfig = {
  expense: { label: "Расходы", color: SERIES.expense },
  income: { label: "Доходы", color: SERIES.income },
} satisfies ChartConfig;

export default function StatsPage() {
  const [month] = useMonth();
  return (
    <>
      <PageHeader
        title="Статистика"
        subtitle={formatMonth(month)}
        action={
          <div className="hidden md:block">
            <MonthPicker />
          </div>
        }
      />
      <div className="-mt-3 mb-4 md:hidden">
        <MonthPicker variant="inline" />
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        <SummaryTiles month={month} />
        <SavingsPanel month={month} />
        <CategoriesPanel month={month} />
        <MonthlyPanel month={month} />
        <DailyPanel month={month} />
      </div>
    </>
  );
}

function SummaryTiles({ month }: { month: string }) {
  const { data: s } = useSummary(month);
  const { data: daily } = useDaily(month, "EXPENSE");
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
      <Tile label="Расходы" value={s?.expense} change={s?.change.expensePct} goodWhenUp={false} />
      <Tile label="Доходы" value={s?.income} change={s?.change.incomePct} goodWhenUp valueClassName="text-income" />
      <Tile label="Отложено" value={s?.saved} valueClassName="text-brand" hint="в накопления" />
      <Tile
        label="Свободный остаток"
        value={s?.free}
        signed
        hint={s ? `${s.count} ${pluralize(s.count, ["операция", "операции", "операций"])}` : undefined}
      />
      <Tile
        className="col-span-2 lg:col-span-1"
        label="В среднем в день"
        value={daily?.avgPerDay}
        hint={daily?.maxDay ? `макс. ${formatMoney(daily.maxDay.total)} · ${formatDay(daily.maxDay.date).toLowerCase()}` : undefined}
      />
    </div>
  );
}

function Tile({
  label,
  value,
  change,
  goodWhenUp,
  hint,
  signed,
  valueClassName,
  className,
}: {
  className?: string;
  label: string;
  value: number | undefined;
  change?: number | null;
  goodWhenUp?: boolean;
  hint?: string;
  signed?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-2xl border border-border/80 bg-surface p-4 md:p-5", className)}>
      <div className="text-[13px] text-muted-foreground">{label}</div>
      {value === undefined ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <div
          className={cn(
            "mt-1 truncate text-lg font-semibold tracking-tight md:text-2xl",
            signed && value < 0 && "text-expense",
            valueClassName,
          )}
        >
          {signed && value < 0 ? "− " : ""}
          {formatMoney(value)}
        </div>
      )}
      <div className="mt-1 min-h-4 text-xs">
        {change !== undefined && change !== null && change !== 0 ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              (change > 0) === goodWhenUp ? "text-income" : "text-expense",
            )}
            title="по сравнению с прошлым месяцем"
          >
            {change > 0 ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
            {Math.abs(change).toLocaleString("ru-RU")}%
            <span className="ml-1 font-normal whitespace-nowrap text-muted-foreground lg:hidden">к прошлому месяцу</span>
          </span>
        ) : (
          hint && <span className="text-muted-foreground">{hint}</span>
        )}
      </div>
    </div>
  );
}

function TypeSwitch({ value, onChange }: { value: CategoryType; onChange: (t: CategoryType) => void }) {
  return (
    <div className="grid h-9 grid-cols-2 rounded-xl bg-muted p-1 text-[13px]">
      {(["EXPENSE", "INCOME"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "rounded-lg px-3 font-medium transition",
            value === t ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t === "EXPENSE" ? "Расходы" : "Доходы"}
        </button>
      ))}
    </div>
  );
}

function CategoriesPanel({ month }: { month: string }) {
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const { data } = useCategoryStats(month, type);
  const rows = data ? toRows(data) : [];
  return (
    <Panel>
      <PanelTitle action={<TypeSwitch value={type} onChange={setType} />}>По категориям</PanelTitle>
      {!data ? (
        <BreakdownSkeleton />
      ) : !rows.length ? (
        <EmptyBreakdown type={type} />
      ) : (
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <Donut rows={rows.length > 8 ? toRows(data, 7) : rows} total={data.total} className="w-[220px] md:w-[260px] md:max-w-[260px]" />
          <div className="w-full md:flex-1">
            <CategoryBars rows={rows} />
          </div>
        </div>
      )}
    </Panel>
  );
}

function MonthlyPanel({ month }: { month: string }) {
  // Ряд заканчивается выбранным месяцем (или текущим, если выбран прошлый — тогда видно и «после»).
  const until = month < currentMonth() ? currentMonth() : month;
  const { data } = useMonthly(until, 12);
  const hasData = data?.some((m) => m.income || m.expense);

  return (
    <Panel>
      <PanelTitle action={<Legend />}>Доходы и расходы за год</PanelTitle>
      {!data ? (
        <Skeleton className="h-64 w-full" />
      ) : !hasData ? (
        <div className="py-14 text-center text-sm text-muted-foreground">Пока нет данных</div>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
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
            <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={axisMoney} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", radius: 6 }}
              content={({ active, payload, label }) => (
                <MoneyTooltip active={active} payload={payload} title={formatMonth(String(label))} />
              )}
            />
            {(["income", "expense"] as const).map((key) => (
              <Bar key={key} dataKey={key} name={chartConfig[key].label} fill={SERIES[key]} radius={[4, 4, 0, 0]} maxBarSize={18}>
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

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {(["income", "expense"] as const).map((key) => (
        <span key={key} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: SERIES[key] }} />
          {chartConfig[key].label}
        </span>
      ))}
    </div>
  );
}

function DailyPanel({ month }: { month: string }) {
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const { data } = useDaily(month, type);
  const color = type === "EXPENSE" ? SERIES.expense : SERIES.income;

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
            <Figure label="Всего" value={formatMoney(data.total)} />
            <Figure label="В среднем в день" value={formatMoney(data.avgPerDay)} />
            {data.maxDay && (
              <Figure label="Самый крупный день" value={`${formatMoney(data.maxDay.total)} · ${formatDay(data.maxDay.date).toLowerCase()}`} />
            )}
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
            <BarChart data={data.days} barCategoryGap="18%" margin={{ left: 0, right: 0, top: 8 }}>
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
              <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={axisMoney} />
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
              <Bar dataKey="total" name={type === "EXPENSE" ? "Расходы" : "Доходы"} fill={color} radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ChartContainer>
        </>
      )}
    </Panel>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
