"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/config";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import { MobileMenu } from "./MobileMenu";

/**
 * Десктоп: крупный заголовок + подзаголовок + действие справа.
 * Телефон: ‹ назад на главную, заголовок, действие и меню ⋮.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  back = true,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  back?: boolean;
}) {
  const withMonth = useHrefWithMonth();
  return (
    <header className="mb-5 flex items-start justify-between gap-4 md:mb-8">
      <div className="flex min-w-0 items-start gap-1">
        {back && (
          <Link
            href={withMonth(ROUTES.home)}
            className="-ml-2 flex size-9 shrink-0 items-center justify-center rounded-full transition hover:bg-muted md:hidden"
            aria-label="На главную"
          >
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight md:text-[32px] md:leading-tight">{title}</h1>
          {subtitle && <div className="mt-0.5 text-sm text-muted-foreground md:mt-1.5 md:text-[15px]">{subtitle}</div>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        <MobileMenu />
      </div>
    </header>
  );
}
