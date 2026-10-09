"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { type Transaction, useCreateTransaction, useUpdateTransaction } from "@/entities/transaction";
import { formatMoney, toISODate } from "@/shared/lib/format";
import { fromKopecks, pressKey, toKopecks } from "../lib/amount";
import type { FormProps } from "../model/form-props";
import { useAmountKeyboard } from "../model/use-amount-keyboard";
import { useConfirmDelete } from "../model/use-confirm-delete";
import { AmountHero } from "./AmountHero";
import { DateChip } from "./DateChip";
import { FormShell } from "./FormShell";
import { Keypad } from "./Keypad";
import { SaveButton } from "./SaveButton";

/** «Отложить»: сумма и дата (по умолчанию сегодня). С tx — редактирование. */
export function SavingForm({ tx, onDone, onClose }: FormProps & { tx?: Transaction }) {
  const [amount, setAmount] = useState(tx ? fromKopecks(tx.amount) : "");
  const [date, setDate] = useState(tx?.date ?? toISODate(new Date()));
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const confirmDelete = useConfirmDelete("Удалить операцию? Накопления пересчитаются.", onDone);
  const pending = create.isPending || update.isPending;
  const kopecks = toKopecks(amount);
  const canSave = kopecks > 0 && !pending;

  const submit = useCallback(() => {
    if (!canSave) return;
    const callbacks = {
      onSuccess: () => {
        toast.success(tx ? "Сохранено" : `Отложено ${formatMoney(kopecks)}`);
        onDone();
      },
      onError: (err: Error) => toast.error(err.message),
    };
    // PATCH принимает только изменяемые поля — тип у существующей операции не передаём.
    if (tx) update.mutate({ id: tx.id, body: { amount: kopecks, date } }, callbacks);
    else create.mutate({ type: "SAVING", amount: kopecks, date }, callbacks);
  }, [canSave, create, date, kopecks, onDone, tx, update]);
  useAmountKeyboard(setAmount, submit);

  return (
    <FormShell
      title={tx ? "Отложено" : "Отложить"}
      onBack={onClose}
      onDelete={tx ? () => confirmDelete(tx.id) : undefined}
    >
      <AmountHero type="SAVING" amount={amount} />
      <div className="flex justify-center">
        <DateChip value={date} onChange={setDate} />
      </div>
      <div className="mt-4">
        <Keypad onKey={(key) => setAmount((v) => pressKey(v, key))} />
      </div>
      <SaveButton type="SAVING" onClick={submit} disabled={!canSave} pending={pending} />
    </FormShell>
  );
}
