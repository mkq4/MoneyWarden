import { cn } from "@/shared/lib/cn";
import { TYPE_FILTER_OPTIONS } from "../model/history.const";
import type { TypeFilter } from "../model/types";

export function TypeSegmented({ value, onChange }: { value: TypeFilter; onChange: (value: TypeFilter) => void }) {
  return (
    <div className="grid h-10 shrink-0 grid-cols-3 rounded-xl bg-muted p-1 text-sm md:w-72">
      {TYPE_FILTER_OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg font-medium transition",
            value === o.value ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
