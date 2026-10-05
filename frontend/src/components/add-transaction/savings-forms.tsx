"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDay, formatMoney, formatSigned, toISODate } from "@/lib/format";
import { useDeleteTransaction, useSaveTransaction, useSavings, useSetSavingsBalance } from "@/lib/queries";
import type { Transaction } from "@/lib/types";
import { fromKopecks, pressKey, toKopecks } from "./amount";
import { AmountHero, DateChip, FormShell, SaveButton, useAmountKeyboard } from "./form-parts";
import { Keypad } from "./keypad";

interface FormProps {
  onDone: () => void;
  onClose: () => void;
}

function useDeleteWithConfirm(tx: Transaction | undefined, onDone: () => void) {
  const remove = useDeleteTransaction();
  if (!tx) return undefined;
  return () => {
    if (!confirm("Удалить операцию? Накопления пересчитаются.")) return;
    remove.mutate(tx.id, {
      onSuccess: () => {
        toast.success("Операция удалена");
        onDone();
      },
      onError: (err) => toast.error(err.message),
    });
  };
}

/** «Отложить»: сумма и дата (по умолчанию сегодня). С tx — редактирование. */
export function SavingForm({ tx, onDone, onClose }: FormProps & { tx?: Transaction }) {
  const [amount, setAmount] = useState(tx ? fromKopecks(tx.amount) : "");
  const [date, setDate] = useState(tx?.date ?? toISODate(new Date()));
  const save = useSaveTransaction();
  const onDelete = useDeleteWithConfirm(tx, onDone);
  const kopecks = toKopecks(amount);
  const canSave = kopecks > 0 && !save.isPending;

  const submit = useCallback(() => {
    if (!canSave) return;
    // PATCH принимает только изменяемые поля — тип у существующей операции не передаём.
    const input = tx ? { id: tx.id, amount: kopecks, date } : { type: "SAVING" as const, amount: kopecks, date };
    save.mutate(input, {
      onSuccess: () => {
        toast.success(tx ? "Сохранено" : `Отложено ${formatMoney(kopecks)}`);
        onDone();
      },
      onError: (err) => toast.error(err.message),
    });
  }, [canSave, date, kopecks, onDone, save, tx]);
  useAmountKeyboard(setAmount, submit);

  return (
    <FormShell title={tx ? "Отложено" : "Отложить"} onBack={onClose} onDelete={onDelete}>
      <AmountHero type="SAVING" amount={amount} />
      <div className="flex justify-center">
        <DateChip value={date} onChange={setDate} />
      </div>
      <div className="mt-4">
        <Keypad onKey={(key) => setAmount((v) => pressKey(v, key))} />
      </div>
      <SaveButton type="SAVING" onClick={submit} disabled={!canSave} pending={save.isPending} />
    </FormShell>
  );
}

/** «Изменить баланс»: одно поле с текущими накоплениями. */
export function BalanceForm({ onDone, onClose }: FormProps) {
  const { data } = useSavings();
  return (
    <FormShell title="Изменить баланс" onBack={onClose}>
      {data ? (
        <BalanceFields initial={data.total} onDone={onDone} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-12 w-40" />
        </div>
      )}
    </FormShell>
  );
}

function BalanceFields({ initial, onDone }: { initial: number; onDone: () => void }) {
  // Отрицательный total (после удаления старых накоплений) подставляем как 0.
  const [amount, setAmount] = useState(initial > 0 ? fromKopecks(initial) : "");
  const setBalance = useSetSavingsBalance();
  const kopecks = toKopecks(amount);

  const submit = useCallback(() => {
    if (setBalance.isPending) return;
    setBalance.mutate(kopecks, {
      onSuccess: (res) => {
        toast.success(res.adjustment ? "Баланс накоплений обновлён" : "Баланс не изменился");
        onDone();
      },
      onError: (err) => toast.error(err.message),
    });
  }, [kopecks, onDone, setBalance]);
  useAmountKeyboard(setAmount, submit);

  return (
    <>
      <AmountHero type="SAVING_ADJUSTMENT" amount={amount} caption="Сколько у тебя сейчас отложено" />
      <p className="mx-auto max-w-[300px] text-center text-xs text-muted-foreground">
        Разница с текущим балансом ({formatMoney(initial)}) запишется как корректировка накоплений и не
        попадёт в статистику месяца.
      </p>
      <div className="mt-4">
        <Keypad onKey={(key) => setAmount((v) => pressKey(v, key))} />
      </div>
      <SaveButton type="SAVING_ADJUSTMENT" onClick={submit} disabled={setBalance.isPending} pending={setBalance.isPending} />
    </>
  );
}

/** Корректировку нельзя редактировать — только посмотреть и удалить. */
export function AdjustmentView({ tx, onDone, onClose }: FormProps & { tx: Transaction }) {
  const onDelete = useDeleteWithConfirm(tx, onDone)!;
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
      <Button variant="destructive" className="h-12 w-full rounded-2xl" onClick={onDelete}>
        Удалить корректировку
      </Button>
    </FormShell>
  );
}
