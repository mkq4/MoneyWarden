"use client";

import Link from "next/link";
import { ROUTES } from "@/shared/config";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import { Logo } from "@/shared/ui/logo";

export function SidebarLogo() {
  const withMonth = useHrefWithMonth();
  return (
    <Link href={withMonth(ROUTES.home)} className="mb-10 flex items-center gap-3 px-2">
      <Logo size={36} />
      <span className="text-[15px] font-semibold tracking-tight">MoneyWarden</span>
    </Link>
  );
}
