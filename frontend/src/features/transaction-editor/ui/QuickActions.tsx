"use client";

import { ChartNoAxesColumn } from "lucide-react";
import { TypeBadge } from "@/entities/transaction";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import { ActionCard } from "../components";
import { useTransactionEditor } from "../model/context";

/**
 * Три большие кнопки: Расход / Доход / Статистика.
 * Используются в «Быстрых действиях» дашборда и на стартовом экране телефона.
 */
export function QuickActions({
  layout = "row",
  onSaved,
}: {
  layout?: "row" | "stack";
  onSaved?: () => void;
}) {
  const { openAdd } = useTransactionEditor();
  const withMonth = useHrefWithMonth();
  const stack = layout === "stack";

  return (
    <div className={cn("grid gap-3", stack ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3 md:gap-5")}>
      <ActionCard
        onClick={() => openAdd("EXPENSE", { onSaved })}
        icon={<TypeBadge type="EXPENSE" />}
        title={stack ? "Расход" : "Добавить расход"}
        subtitle={stack ? undefined : "Запишите трату"}
      />
      <ActionCard
        onClick={() => openAdd("INCOME", { onSaved })}
        icon={<TypeBadge type="INCOME" />}
        title={stack ? "Доход" : "Добавить доход"}
        subtitle={stack ? undefined : "Зарплата, подработка"}
      />
      <ActionCard
        href={withMonth(ROUTES.stats)}
        icon={
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground/80">
            <ChartNoAxesColumn className="size-5" strokeWidth={2.5} />
          </span>
        }
        title="Статистика"
        subtitle={stack ? undefined : "Посмотрите аналитику"}
      />
    </div>
  );
}
