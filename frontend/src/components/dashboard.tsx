"use client";

import { MonthPicker } from "@/components/month-picker";
import { MobileMenu } from "@/components/mobile-menu";
import { Panel, PanelTitle } from "@/components/panel";
import { QuickActions } from "@/components/quick-actions";
import { MonthExtras, SummaryCards } from "@/components/summary-cards";
import { TransactionRow } from "@/components/transaction-row";
import {
  BreakdownSkeleton,
  CategoryBars,
  Donut,
  EmptyBreakdown,
  toRows,
} from "@/components/category-breakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { currentMonth, formatMonth } from "@/lib/format";
import { useCategoryStats, useMe, useTransactions } from "@/lib/queries";
import { useHrefWithMonth, useMonth } from "@/lib/use-month";

export function Dashboard() {
  const [month] = useMonth();
  const withMonth = useHrefWithMonth();
  const { data: me } = useMe();
  const name = me?.name || me?.username;
  const isCurrent = month === currentMonth();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Десктоп: «Привет!» + выбор месяца */}
      <header className="mb-2 hidden items-start justify-between gap-4 md:flex">
        <div>
          <h1 className="text-[32px] leading-tight font-semibold tracking-tight">
            Привет{name ? `, ${name}` : ""}!
          </h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            {isCurrent
              ? "Вот как прошли твои финансы в этом месяце"
              : `Вот как прошли твои финансы: ${formatMonth(month).toLowerCase()}`}
          </p>
        </div>
        <MonthPicker />
      </header>

      {/* Телефон: «Мой бюджет» как в макете */}
      <header className="flex items-start justify-between md:hidden">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Мой бюджет</h1>
          <MonthPicker variant="inline" />
        </div>
        <MobileMenu />
      </header>

      <SummaryCards month={month} />
      <MonthExtras month={month} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Panel>
          <PanelTitle href={withMonth("/stats")}>Расходы по категориям</PanelTitle>
          <ExpenseBreakdown month={month} />
        </Panel>
        <Panel>
          <PanelTitle href={withMonth("/history")}>История</PanelTitle>
          <RecentTransactions month={month} />
        </Panel>
      </div>

      <Panel>
        <PanelTitle>Быстрые действия</PanelTitle>
        <QuickActions />
      </Panel>
    </div>
  );
}

function ExpenseBreakdown({ month }: { month: string }) {
  const { data } = useCategoryStats(month, "EXPENSE");
  if (!data) return <BreakdownSkeleton />;
  if (!data.items.length) return <EmptyBreakdown type="EXPENSE" />;
  const rows = toRows(data, 4);
  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
      <Donut rows={rows} total={data.total} className="hidden md:block md:w-[44%]" />
      <div className="w-full md:flex-1">
        <CategoryBars rows={rows} />
      </div>
    </div>
  );
}

function RecentTransactions({ month }: { month: string }) {
  const { data, isPending } = useTransactions({ month }, 5);
  const items = data?.pages[0]?.items;
  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }
  if (!items?.length) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Операций за этот месяц пока нет</div>;
  }
  return (
    <div className="-my-1 divide-y divide-border/70">
      {items.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}
