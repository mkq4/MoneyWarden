"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import { Logo } from "@/shared/ui/logo";
import { MAIN_NAV, SETTINGS_NAV, type NavItem } from "../config/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 md:pl-[248px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 pt-4 pb-10 sm:px-6 md:px-10 md:pt-12">
          {children}
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border/70 bg-sidebar px-5 py-10 md:flex">
      <SidebarLogo />
      <nav className="flex flex-col gap-1">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="mt-auto">
        <NavLink item={SETTINGS_NAV} />
      </div>
    </aside>
  );
}

function SidebarLogo() {
  const withMonth = useHrefWithMonth();
  return (
    <Link href={withMonth(ROUTES.home)} className="mb-10 flex items-center gap-3 px-2">
      <Logo size={36} />
      <span className="text-[15px] font-semibold tracking-tight">MoneyWarden</span>
    </Link>
  );
}

function NavLink({ item }: { item: NavItem }) {
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
