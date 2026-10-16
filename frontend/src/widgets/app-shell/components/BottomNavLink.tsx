"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import type { NavItem } from "../model/types";

export function BottomNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const withMonth = useHrefWithMonth();
  const active = pathname !== null && item.match.includes(pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.keepMonth ? withMonth(item.href) : item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors",
        active ? "font-medium text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} />
      {item.label}
    </Link>
  );
}
