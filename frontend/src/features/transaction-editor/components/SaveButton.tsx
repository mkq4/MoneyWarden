import type { TransactionType } from "@/entities/transaction";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { SAVE_BUTTON_COLORS } from "../model/transaction-editor.const";

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
      className={cn("mt-4 h-12 w-full rounded-2xl text-[15px] font-semibold text-white", SAVE_BUTTON_COLORS[type])}
    >
      {pending ? "Сохраняем…" : label}
    </Button>
  );
}
