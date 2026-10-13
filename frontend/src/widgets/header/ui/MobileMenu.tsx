"use client";

import { ChartNoAxesColumn, EllipsisVertical, History, Hourglass, House, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/features/auth";
import { ROUTES } from "@/shared/config";
import { useHrefWithMonth } from "@/shared/lib/month-param";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

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
        <DropdownMenuItem onClick={() => router.push(withMonth(ROUTES.home))}>
          <House /> Главная
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(withMonth(ROUTES.history))}>
          <History /> История
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(withMonth(ROUTES.stats))}>
          <ChartNoAxesColumn /> Статистика
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(ROUTES.reminders)}>
          <Hourglass /> Подумать
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(ROUTES.settings)}>
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
