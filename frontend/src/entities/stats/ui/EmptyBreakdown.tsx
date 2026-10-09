import type { CategoryType } from "@/entities/category/@x/stats";

export function EmptyBreakdown({ type }: { type: CategoryType }) {
  return (
    <div className="py-8 text-center text-sm text-muted-foreground">
      {type === "INCOME" ? "Доходов" : "Расходов"} за этот период пока нет
    </div>
  );
}
