"use client";

import { ChevronRight, PiggyBank } from "lucide-react";
import { useSavings } from "@/entities/savings";
import { useSummary } from "@/entities/stats";
import { useTransactionEditor } from "@/features/transaction-editor";
import { currentMonth, formatMoney, formatMonthPrepositional } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { Skeleton } from "@/shared/ui/skeleton";

/** «Накопления»: всего, отложено в выбранном месяце, «Отложить» и «Изменить баланс». */
export function SavingsPanel({ month }: { month: string }) {
  const { openSaving, openBalance } = useTransactionEditor();
  const { data: savings } = useSavings();
  const { data: summary } = useSummary(month);
  const monthLabel = month === currentMonth() ? "в этом месяце" : `в ${formatMonthPrepositional(month)}`;

  return (
    <Panel>
      <PanelTitle>Накопления</PanelTitle>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        {!savings ? (
          <Skeleton className="h-16 w-56" />
        ) : savings.total === 0 ? (
          <button
            type="button"
            onClick={() => openBalance()}
            className="group flex flex-1 items-center gap-4 rounded-2xl bg-brand-soft/60 px-4 py-3.5 text-left transition hover:bg-brand-soft md:max-w-md"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-brand">
              <PiggyBank className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">Укажи текущие накопления</span>
              <span className="block text-xs text-muted-foreground">
                Сколько у тебя уже отложено — дальше будем считать сами
              </span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
          </button>
        ) : (
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <div className="text-[13px] text-muted-foreground">Накоплено всего</div>
              <div className="mt-0.5 text-2xl font-semibold tracking-tight md:text-[28px]">
                {savings.total < 0 ? "− " : ""}
                {formatMoney(savings.total)}
              </div>
            </div>
            <div>
              <div className="text-[13px] text-muted-foreground">Отложено {monthLabel}</div>
              <div className="mt-0.5 text-2xl font-semibold tracking-tight text-brand md:text-[28px]">
                {summary ? formatMoney(summary.saved) : "…"}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button className="h-10 flex-1 rounded-xl px-4 md:flex-none" onClick={() => openSaving()}>
            <PiggyBank /> Отложить
          </Button>
          <Button variant="outline" className="h-10 flex-1 rounded-xl px-4 md:flex-none" onClick={() => openBalance()}>
            Изменить баланс
          </Button>
        </div>
      </div>
    </Panel>
  );
}
