import type { TransactionType } from "@/entities/transaction";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

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
