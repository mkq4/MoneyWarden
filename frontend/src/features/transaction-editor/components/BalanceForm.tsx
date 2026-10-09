"use client";

import { useSavings } from "@/entities/savings";
import { Skeleton } from "@/shared/ui/skeleton";
import type { FormProps } from "../model/form-props";
import { BalanceFields } from "./BalanceFields";
import { FormShell } from "./FormShell";

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
