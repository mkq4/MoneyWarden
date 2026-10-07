import { TypeBadge, type TransactionType } from "@/entities/transaction";
import { cn } from "@/shared/lib/cn";
import { displayAmount, toKopecks } from "../lib/amount";

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
