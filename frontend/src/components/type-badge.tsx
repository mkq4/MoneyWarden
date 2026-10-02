import { Minus, Plus } from "lucide-react";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Круглый значок «−» (расход) / «+» (доход) как в макетах. */
export function TypeBadge({
  type,
  className,
  size = "md",
}: {
  type: TransactionType;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const Icon = type === "INCOME" ? Plus : Minus;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        type === "INCOME" ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
        size === "sm" && "size-8 [&_svg]:size-4",
        size === "md" && "size-10 [&_svg]:size-5",
        size === "lg" && "size-12 [&_svg]:size-6",
        size === "xl" && "size-16 [&_svg]:size-8",
        className,
      )}
    >
      <Icon strokeWidth={2.75} />
    </span>
  );
}
