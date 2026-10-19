"use client";

import { Minus, Plus } from "lucide-react";
import { useTransactionEditor } from "../model/context";

/** Десктоп: «Расход» / «Доход» в сайдбаре — доступны с любой страницы без прокрутки. */
export function AddButtons() {
  const { openAdd } = useTransactionEditor();
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => openAdd("EXPENSE")}
        className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-expense-soft text-sm font-medium text-expense transition hover:brightness-95"
      >
        <Minus className="size-4" strokeWidth={2.75} />
        Расход
      </button>
      <button
        type="button"
        onClick={() => openAdd("INCOME")}
        className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-income-soft text-sm font-medium text-income transition hover:brightness-95"
      >
        <Plus className="size-4" strokeWidth={2.75} />
        Доход
      </button>
    </div>
  );
}
