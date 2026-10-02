"use client";

import { BarChart3, ChartNoAxesColumn, History, House, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { useHrefWithMonth } from "@/lib/use-month";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "Главная", icon: House, match: ["/", "/home"] },
  { href: "/history", label: "История", icon: History, match: ["/history"] },
  { href: "/stats", label: "Статистика", icon: ChartNoAxesColumn, match: ["/stats"] },
];

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
  const pathname = usePathname();
  const withMonth = useHrefWithMonth();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border/70 bg-sidebar px-5 py-10 md:flex">
      <Link href={withMonth("/home")} className="mb-10 flex items-center gap-3 px-2">
        <Logo size={36} />
        <span className="text-[15px] font-semibold tracking-tight">MoneyWarden</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            href={withMonth(item.href)}
            active={item.match.includes(pathname)}
            icon={item.icon}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto">
        <NavLink href="/settings" active={pathname === "/settings"} icon={Settings}>
          Настройки
        </NavLink>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: typeof BarChart3;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        active ? "bg-sidebar-accent font-medium text-foreground" : "text-foreground/70 hover:bg-sidebar-accent/60",
      )}
    >
      <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 2} />
      {children}
    </Link>
  );
}
