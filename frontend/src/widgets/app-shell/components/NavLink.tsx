"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import type { NavItem } from "../model/types";

export function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const withMonth = useHrefWithMonth();
  const active = pathname !== null && item.match.includes(pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.keepMonth ? withMonth(item.href) : item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        active ? "bg-sidebar-accent font-medium text-foreground" : "text-foreground/70 hover:bg-sidebar-accent/60",
      )}
    >
      <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 2} />
      {item.label}
    </Link>
  );
}
