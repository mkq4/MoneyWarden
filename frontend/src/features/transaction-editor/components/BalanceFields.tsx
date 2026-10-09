"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSetSavingsBalance } from "@/entities/savings";
import { formatMoney } from "@/shared/lib/format";
import { fromKopecks, pressKey, toKopecks } from "../lib/amount";
import { useAmountKeyboard } from "../model/use-amount-keyboard";
import { AmountHero } from "./AmountHero";
import { Keypad } from "./Keypad";
import { SaveButton } from "./SaveButton";

export function BalanceFields({ initial, onDone }: { initial: number; onDone: () => void }) {
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
