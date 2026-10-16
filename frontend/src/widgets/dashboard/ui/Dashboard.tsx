"use client";

import { getDisplayName, useMe } from "@/entities/user";
import { MonthPicker } from "@/features/month-select";
import { QuickActions } from "@/features/transaction-editor";
import { ROUTES } from "@/shared/config";
import { currentMonth, formatMonth } from "@/shared/lib/format";
import { useHrefWithMonth, useMonth } from "@/shared/lib/month-param";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { ExpenseBreakdown, MonthExtras, RecentTransactions, SummaryCards } from "../components";

/**
 * Главная: итоги месяца, расходы по категориям, последние операции.
 * notices — уведомления над итогами (слот, чтобы виджет не зависел от других виджетов).
 */
export function Dashboard({ notices }: { notices?: React.ReactNode }) {
  const [month] = useMonth();
  const withMonth = useHrefWithMonth();
  const { data: me } = useMe();
  const name = getDisplayName(me);
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
      <header className="md:hidden">
        <h1 className="text-[22px] font-semibold tracking-tight">Мой бюджет</h1>
        <MonthPicker variant="inline" />
      </header>

      {notices}
      <SummaryCards month={month} />
      <MonthExtras month={month} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Panel>
          <PanelTitle href={withMonth(ROUTES.stats)}>Расходы по категориям</PanelTitle>
          <ExpenseBreakdown month={month} />
        </Panel>
        <Panel>
          <PanelTitle href={withMonth(ROUTES.history)}>История</PanelTitle>
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
