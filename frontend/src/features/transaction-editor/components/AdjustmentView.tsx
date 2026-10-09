"use client";

import { formatSigned, type Transaction } from "@/entities/transaction";
import { formatDay } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import type { FormProps } from "../model/form-props";
import { useConfirmDelete } from "../model/use-confirm-delete";
import { FormShell } from "./FormShell";

/** Корректировку нельзя редактировать — только посмотреть и удалить. */
export function AdjustmentView({ tx, onDone, onClose }: FormProps & { tx: Transaction }) {
  const confirmDelete = useConfirmDelete("Удалить операцию? Накопления пересчитаются.", onDone);
  return (
    <FormShell title="Корректировка накоплений" onBack={onClose}>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
        <div className="text-5xl font-normal tracking-tight tabular-nums">{formatSigned(tx.amount, tx.type)}</div>
        <div className="text-sm text-muted-foreground">{formatDay(tx.date)}</div>
        <p className="mt-4 max-w-[300px] text-xs text-muted-foreground">
          Создаётся при изменении баланса накоплений. Изменить её нельзя — можно удалить или задать баланс
          заново.
        </p>
      </div>
      <Button variant="destructive" className="h-12 w-full rounded-2xl" onClick={() => confirmDelete(tx.id)}>
        Удалить корректировку
      </Button>
    </FormShell>
  );
}
