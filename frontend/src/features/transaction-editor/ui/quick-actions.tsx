"use client";

import { ChartNoAxesColumn, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TypeBadge } from "@/entities/transaction";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { useHrefWithMonth } from "@/shared/lib/month-param";
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

function ActionCard({
  icon,
  title,
  subtitle,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "group flex w-full items-center gap-4 rounded-2xl border border-border/80 bg-surface px-4 py-3.5 text-left transition hover:border-border hover:bg-muted/30 md:px-5 md:py-5";
  const content = (
    <>
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
