"use client";

import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/entities/category/@x/transaction";
import { cn } from "@/shared/lib/cn";
import { formatWhen } from "@/shared/lib/format";
import { describeTransaction } from "../lib/describe";
import { formatSigned } from "../lib/format-signed";
import { isSavingType } from "../model/guards";
import type { Transaction } from "../model/types";
import { TypeBadge } from "./TypeBadge";

/**
 * Строка истории как в макете: заголовок — комментарий (если есть) или
 * категория; подзаголовок — категория или «Доход»/«Расход».
 */
export function TransactionRow({
  tx,
  onClick,
  showTime = true,
}: {
  tx: Transaction;
  onClick: (tx: Transaction) => void;
  showTime?: boolean;
}) {
  const income = tx.type === "INCOME";
  const saving = isSavingType(tx.type);
  const { title, subtitle } = describeTransaction(tx);

  // Обёртка нужна, чтобы разделитель списка (divide-y) не скруглялся вместе с кнопкой.
  return (
    <div>
      <button
        type="button"
        onClick={() => onClick(tx)}
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
