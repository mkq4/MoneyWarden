import type { CategoryType } from "@/entities/category";
import { cn } from "@/shared/lib/cn";

const TYPES: CategoryType[] = ["EXPENSE", "INCOME"];

export function TypeSwitch({ value, onChange }: { value: CategoryType; onChange: (type: CategoryType) => void }) {
  return (
    <div className="grid h-9 grid-cols-2 rounded-xl bg-muted p-1 text-[13px]">
      {TYPES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "rounded-lg px-3 font-medium transition",
            value === t ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t === "EXPENSE" ? "Расходы" : "Доходы"}
        </button>
      ))}
    </div>
  );
}
