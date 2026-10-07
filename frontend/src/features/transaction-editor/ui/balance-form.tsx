"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSavings, useSetSavingsBalance } from "@/entities/savings";
import { formatMoney } from "@/shared/lib/format";
import { Skeleton } from "@/shared/ui/skeleton";
import { fromKopecks, pressKey, toKopecks } from "../lib/amount";
import type { FormProps } from "../model/form-props";
import { useAmountKeyboard } from "../model/use-amount-keyboard";
import { AmountHero } from "./amount-hero";
import { FormShell } from "./form-shell";
import { Keypad } from "./keypad";
import { SaveButton } from "./save-button";

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
    setBalance.mutate(
      { targetAmount: kopecks },
      {
        onSuccess: (res) => {
          toast.success(res.adjustment ? "Баланс накоплений обновлён" : "Баланс не изменился");
          onDone();
        },
        onError: (err) => toast.error(err.message),
      },
    );
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
