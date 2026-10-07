"use client";

import { TransactionRow, useTransactions } from "@/entities/transaction";
import { useTransactionEditor } from "@/features/transaction-editor";
import { Skeleton } from "@/shared/ui/skeleton";

export function RecentTransactions({ month }: { month: string }) {
  const { openEdit } = useTransactionEditor();
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
        <TransactionRow key={tx.id} tx={tx} onClick={openEdit} />
      ))}
    </div>
  );
}
