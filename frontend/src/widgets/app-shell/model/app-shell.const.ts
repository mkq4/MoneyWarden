import { ChartNoAxesColumn, History, House, Settings } from "lucide-react";
import { ROUTES } from "@/shared/config";
import type { NavItem } from "./types";

export const MAIN_NAV: NavItem[] = [
  { href: ROUTES.home, label: "Главная", icon: House, match: [ROUTES.start, ROUTES.home], keepMonth: true },
  { href: ROUTES.history, label: "История", icon: History, match: [ROUTES.history], keepMonth: true },
  { href: ROUTES.stats, label: "Статистика", icon: ChartNoAxesColumn, match: [ROUTES.stats], keepMonth: true },
];

export const SETTINGS_NAV: NavItem = {
  href: ROUTES.settings,
  label: "Настройки",
  icon: Settings,
  match: [ROUTES.settings],
  keepMonth: false,
};
