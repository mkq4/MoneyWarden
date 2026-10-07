"use client";

import { TransactionRow, type Transaction } from "@/entities/transaction";
import { useTransactionEditor } from "@/features/transaction-editor";
import { formatDay, formatMoney } from "@/shared/lib/format";
import { groupByDay } from "../lib/group-by-day";

/** Операции сгруппированы по дням с итогом расходов за день. */
export function GroupedList({ items }: { items: Transaction[] }) {
  const { openEdit } = useTransactionEditor();
  return (
    <div className="flex flex-col">
      {groupByDay(items).map((g) => (
        <section key={g.date} className="pt-4 first:pt-2">
          <div className="flex items-baseline justify-between pb-1 text-xs font-medium text-muted-foreground">
            <span>{formatDay(g.date)}</span>
            {g.spent > 0 && <span className="tabular-nums">− {formatMoney(g.spent)}</span>}
          </div>
          <div className="divide-y divide-border/60">
            {g.items.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onClick={openEdit} showTime={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
