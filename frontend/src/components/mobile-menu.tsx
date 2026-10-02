"use client";

import { ChartNoAxesColumn, EllipsisVertical, History, House, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/lib/queries";
import { useHrefWithMonth } from "@/lib/use-month";

/** Меню ⋮ в шапке на телефоне — замена сайдбару. */
export function MobileMenu() {
  const router = useRouter();
  const withMonth = useHrefWithMonth();
  const logout = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-full bg-muted transition hover:bg-accent md:hidden"
        aria-label="Меню"
      >
        <EllipsisVertical className="size-[18px]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onClick={() => router.push(withMonth("/home"))}>
          <House /> Главная
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(withMonth("/history"))}>
          <History /> История
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(withMonth("/stats"))}>
          <ChartNoAxesColumn /> Статистика
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings /> Настройки
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()}>
          <LogOut /> Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
