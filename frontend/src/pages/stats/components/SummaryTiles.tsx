"use client";

import { useDaily, useSummary } from "@/entities/stats";
import { formatDay, formatMoney, pluralize } from "@/shared/lib/format";
import { SummaryTile } from "./SummaryTile";

export function SummaryTiles({ month }: { month: string }) {
  const { data: s } = useSummary(month);
  const { data: daily } = useDaily(month, "EXPENSE");
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
      <SummaryTile label="Расходы" value={s?.expense} change={s?.change.expensePct} goodWhenUp={false} />
      <SummaryTile label="Доходы" value={s?.income} change={s?.change.incomePct} goodWhenUp valueClassName="text-income" />
      <SummaryTile label="Отложено" value={s?.saved} valueClassName="text-brand" hint="в накопления" />
      <SummaryTile
        label="Свободный остаток"
        value={s?.free}
        signed
        hint={s ? `${s.count} ${pluralize(s.count, ["операция", "операции", "операций"])}` : undefined}
      />
      <SummaryTile
        className="col-span-2 lg:col-span-1"
        label="В среднем в день"
        value={daily?.avgPerDay}
        hint={daily?.maxDay ? `макс. ${formatMoney(daily.maxDay.total)} · ${formatDay(daily.maxDay.date).toLowerCase()}` : undefined}
      />
    </div>
  );
}
