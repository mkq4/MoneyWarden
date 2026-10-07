import { Minus, PiggyBank, Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { isSavingType } from "../model/guards";
import type { TransactionType } from "../model/types";

/** Круглый значок: «−» расход, «+» доход, копилка — накопления. */
export function TypeBadge({
  type,
  className,
  size = "md",
}: {
  type: TransactionType;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const saving = isSavingType(type);
  const Icon = saving ? PiggyBank : type === "INCOME" ? Plus : Minus;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        saving
          ? "bg-brand-soft text-brand"
          : type === "INCOME"
            ? "bg-income-soft text-income"
            : "bg-expense-soft text-expense",
        size === "sm" && "size-8 [&_svg]:size-4",
        size === "md" && "size-10 [&_svg]:size-5",
        size === "lg" && "size-12 [&_svg]:size-6",
        size === "xl" && "size-16 [&_svg]:size-8",
        className,
      )}
    >
      <Icon strokeWidth={saving ? 2 : 2.75} />
    </span>
  );
}
