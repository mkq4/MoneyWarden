"use client";

import { ChevronRight } from "lucide-react";
import { useTransactionDialog } from "@/components/add-transaction/transaction-dialog";
import { CategoryIcon } from "@/components/category-icon";
import { TypeBadge } from "@/components/type-badge";
import { formatSigned, formatWhen } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Строка истории как в макете: заголовок — комментарий (если есть) или
 * категория; подзаголовок — категория или «Доход»/«Расход».
 */
export function TransactionRow({
  tx,
  showTime = true,
}: {
  tx: Transaction;
  showTime?: boolean;
}) {
  const { openEdit } = useTransactionDialog();
  const income = tx.type === "INCOME";
  const saving = tx.type === "SAVING" || tx.type === "SAVING_ADJUSTMENT";
  const { title, subtitle } = describe(tx);

  // Обёртка нужна, чтобы разделитель списка (divide-y) не скруглялся вместе с кнопкой.
  return (
    <div>
      <button
        type="button"
        onClick={() => openEdit(tx)}
        className="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-muted/60"
      >
        {income || saving || !tx.category ? (
          <TypeBadge type={tx.type} size="md" />
        ) : (
          <CategoryIcon icon={tx.category.icon} color={tx.category.color} />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {subtitle}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div
            className={cn(
              "text-sm font-semibold tabular-nums",
              income && "text-income",
              saving && "text-brand",
            )}
          >
            {formatSigned(tx.amount, tx.type)}
          </div>
          {showTime && (
            <div className="text-xs text-muted-foreground">
              {formatWhen(tx.date, tx.createdAt)}
            </div>
          )}
        </div>
        <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-0.5 sm:block" />
      </button>
    </div>
  );
}

const SAVING_LABELS = {
  SAVING: "Отложено",
  SAVING_ADJUSTMENT: "Корректировка накоплений",
} as const;

/**
 * Заголовок — комментарий (если есть) или категория/название типа;
 * подзаголовок — категория или «Доход»/«Расход»/«Накопления».
 */
function describe(tx: Transaction): { title: string; subtitle: string } {
  if (tx.type === "SAVING" || tx.type === "SAVING_ADJUSTMENT") {
    const label = SAVING_LABELS[tx.type];
    return tx.comment ? { title: tx.comment, subtitle: label } : { title: label, subtitle: "Накопления" };
  }
  const fallback = tx.type === "INCOME" ? "Доход" : "Расход";
  const category = tx.category?.name ?? fallback;
  return tx.comment ? { title: tx.comment, subtitle: category } : { title: category, subtitle: fallback };
}
