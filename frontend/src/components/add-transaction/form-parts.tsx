"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { CalendarDays, ChevronLeft, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import { formatDay, toISODate } from "@/lib/format";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { displayAmount, pressKey, toKopecks } from "./amount";

/** Каркас формы в диалоге: ‹ Заголовок [🗑] + содержимое. */
export function FormShell({
  title,
  onBack,
  onDelete,
  children,
}: {
  title: string;
  onBack: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),1.25rem)] sm:pt-4">
      <div className="relative flex h-11 items-center justify-center">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 flex size-9 items-center justify-center rounded-full transition hover:bg-muted"
          aria-label="Назад"
        >
          <ChevronLeft className="size-5" />
        </button>
        <DialogPrimitive.Title className="text-[15px] font-semibold">{title}</DialogPrimitive.Title>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute right-0 flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-expense-soft hover:text-expense"
            aria-label="Удалить операцию"
          >
            <Trash2 className="size-[18px]" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/** Значок типа + крупная сумма. */
export function AmountHero({
  type,
  amount,
  caption,
}: {
  type: TransactionType;
  amount: string;
  caption?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 sm:flex-none sm:py-7">
      <TypeBadge type={type} size="xl" />
      {caption && <div className="-mb-2 text-sm text-muted-foreground">{caption}</div>}
      <div
        className={cn(
          "text-center text-5xl font-normal tracking-tight tabular-nums transition-colors",
          !toKopecks(amount) && "text-foreground/80",
        )}
        aria-live="polite"
      >
        {displayAmount(amount)} ₽
      </div>
    </div>
  );
}

/** Чип даты «📅 Сегодня» с нативным календарём. */
export function DateChip({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.showPicker?.()}
      className="relative flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-muted px-3 text-sm transition hover:bg-accent"
    >
      <CalendarDays className="size-4 text-muted-foreground" />
      {formatDay(value)}
      <input
        ref={ref}
        type="date"
        value={value}
        max={toISODate(new Date())}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 opacity-0"
        tabIndex={-1}
        aria-label="Дата операции"
      />
    </button>
  );
}

/**
 * Ввод суммы с физической клавиатуры (кроме случаев, когда фокус в поле ввода)
 * и Enter — сохранить.
 */
export function useAmountKeyboard(
  setAmount: React.Dispatch<React.SetStateAction<string>>,
  submit: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const inField = e.target instanceof HTMLInputElement;
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key === "Backspace" ? "backspace" : e.key === "." ? "," : e.key;
      if (/^[\d,]$/.test(key) || key === "backspace") {
        e.preventDefault();
        setAmount((v) => pressKey(v, key));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, setAmount, submit]);
}

const SAVE_COLORS: Record<TransactionType, string> = {
  INCOME: "bg-income hover:bg-income/90",
  EXPENSE: "bg-expense hover:bg-expense/90",
  SAVING: "bg-brand hover:bg-brand/90",
  SAVING_ADJUSTMENT: "bg-brand hover:bg-brand/90",
};

export function SaveButton({
  type,
  onClick,
  disabled,
  pending,
  label = "Сохранить",
}: {
  type: TransactionType;
  onClick: () => void;
  disabled: boolean;
  pending: boolean;
  label?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn("mt-4 h-12 w-full rounded-2xl text-[15px] font-semibold text-white", SAVE_COLORS[type])}
    >
      {pending ? "Сохраняем…" : label}
    </Button>
  );
}
