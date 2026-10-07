"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeft, Trash2 } from "lucide-react";

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
