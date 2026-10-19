"use client";

import { MonthPicker } from "@/features/month-select";
import { PageHeader } from "@/widgets/header";
import { SavingsPanel } from "@/widgets/savings-panel";
import { useMonth } from "@/shared/lib/month-param";
import { CategoriesPanel, DailyPanel, MonthlyPanel, SummaryTiles } from "../components";

export function StatsPage() {
  const [month] = useMonth();
  return (
    <>
      <PageHeader
        title="Статистика"
        subtitle="Куда уходят деньги и откуда приходят"
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
