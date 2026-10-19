"use client";

import { Minus, Plus } from "lucide-react";
import { useTransactionEditor } from "../model/context";

/** Телефон: «−» расход и «+» доход справа снизу над вкладками (BottomNav — 3.5rem). */
export function AddFabs() {
  const { openAdd } = useTransactionEditor();
  return (
    <div className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-30 flex gap-3 md:hidden">
      <button
        type="button"
        onClick={() => openAdd("EXPENSE")}
        aria-label="Добавить расход"
        className="flex size-14 items-center justify-center rounded-full bg-expense text-white shadow-lg transition active:scale-95"
      >
        <Minus className="size-7" strokeWidth={2.75} />
      </button>
      <button
        type="button"
        onClick={() => openAdd("INCOME")}
        aria-label="Добавить доход"
        className="flex size-14 items-center justify-center rounded-full bg-income text-white shadow-lg transition active:scale-95"
      >
        <Plus className="size-7" strokeWidth={2.75} />
      </button>
    </div>
  );
}
